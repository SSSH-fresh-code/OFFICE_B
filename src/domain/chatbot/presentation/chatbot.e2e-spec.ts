import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Body } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../infrastructure/db/prisma.service';
import { PermissionEnum } from '../../../domain/permission/domain/permission.enum';
import * as bcrypt from 'bcrypt';
import * as session from 'express-session';
import * as passport from 'passport';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookie: string;

  const email = "test@test.com";
  const password = "password";
  const name = "nm";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        store: new session.MemoryStore(),
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.user.create({
      data: {
        email: "super@test.com",
        password: bcrypt.hashSync("password", 10),
        name: "name",
        permissions: {
          connect: [{
            name: PermissionEnum.CAN_LOGIN
          }, {
            name: PermissionEnum.CAN_READ_USER
          }, {
            name: PermissionEnum.CAN_WRITE_USER
          }]
        }
      }
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'super@test.com', password: 'password' });

    cookie = response.headers['set-cookie'];
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['User']);
  });

  describe('GET - /users', () => {
    it('유저가 없는 경우 유저 목록 조회', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&take=10&orderby=name&direction=desc')
        .set('Cookie', cookie);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toEqual(0);
    });

    it('유저 목록 조회', async () => {
      await prisma.user.create({ data: { email, password, name } })

      const response = await request(app.getHttpServer())
        .get('/users?page=1&take=10&orderby=name&direction=desc')
        .set('Cookie', cookie);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toEqual(1);
      expect(response.body.total).toEqual(1);
    });

    it('email 일치 검색 테스트', async () => {
      const email2 = "2@2.com";
      await prisma.user.create({ data: { email, password, name } })
      await prisma.user.create({ data: { email: email2, password, name: "name2" } })
      await prisma.user.create({ data: { email: "3@3.com", password, name: "name3" } })

      const response = await request(app.getHttpServer())
        .get(`/users?page=1&take=10&orderby=name&direction=desc&where__email=${email2}`)
        .set('Cookie', cookie);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].email).toEqual(email2);
    });

    it('name like 검색 테스트', async () => {
      const nm1 = "hello";
      const nm2 = "hello2";
      await prisma.user.create({ data: { email, password, name } })
      await prisma.user.create({ data: { email: "2@2.com", password, name: nm1 } })
      await prisma.user.create({ data: { email: "3@3.com", password, name: nm2 } })

      const response = await request(app.getHttpServer())
        .get(`/users?page=1&take=10&orderby=name&direction=desc&like__name=${nm1}`)
        .set('Cookie', cookie);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toEqual(2);
      expect(response.body.data[0].name.includes(nm1)).toBeTruthy();
      expect(response.body.data[1].name.includes(nm1)).toBeTruthy();
    });
  });

  it('/users 유저 이름 업데이트 (PATCH)', async () => {
    const updateName = "LimC2";

    const { id, name } = await prisma.user.create({
      data: {
        email: "test@test.com",
        password: "password",
        name: "LimC"
      }
    });

    const response = await request(app.getHttpServer())
      .put('/users')
      .set('Cookie', cookie)
      .send({
        id: id,
        email: "test2@test.com",
        password: "password2",
        name: "LimC2"
      });
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toEqual(id);
    expect(response.body._name).not.toEqual(name);
    expect(response.body._name).toEqual(updateName);

    return;
  });

  it('/users 유저 생성 (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: "test@test.com",
        password: "password",
        name: "LimC"
      });

    expect(response.statusCode).toBe(201);
    return;
  });

  it('/users 유저 목록 조회 (GET)', async () => {
    await prisma.user.create({ data: { email, password, name } })

    const response = await request(app.getHttpServer())
      .get('/users?page=1&take=10&orderby=name&direction=desc')
      .set('Cookie', cookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toEqual(response.body.total);
  })

  afterAll(async () => {
    await request(app.getHttpServer()).post('/auth/logout')
    await app.close();
  });
});

