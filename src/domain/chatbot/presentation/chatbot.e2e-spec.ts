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
    console.log(response.body.data.length)

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toEqual(response.body.total);
  })

  afterAll(async () => {
    await request(app.getHttpServer()).post('/auth/logout')
    await app.close();
  });
});

