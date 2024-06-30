import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../infrastructure/db/prisma.service';
import { PermissionEnum } from '../../../domain/permission/domain/permission.enum';
import * as session from 'express-session';
import { ExceptionEnum } from '../../../infrastructure/filter/exception/exception.enum';
import { PrismaClientExceptionFilter } from '../../../infrastructure/filter/exception/prisma-exception.filter';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const email = "login@login.com";
  const name = "login";
  const password = "password";

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

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new PrismaClientExceptionFilter());

    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);


  });

  beforeEach(async () => {
    await prismaService.cleanDatabase(['User']);
  });

  describe('POST - /auth/login', () => {
    it('login 권한 있는 계정으로 로그인 시도', async () => {
      await prismaService.user.create({
        data: {
          email, name,
          password: bcrypt.hashSync(password, 10),
          permissions: {
            connect: {
              name: PermissionEnum.CAN_LOGIN
            }
          }
        }
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      expect(response.statusCode).toBe(201);
    });

    it('login 권한 없는 계정 로그인 시도', async () => {
      await prismaService.user.create({
        data: {
          email, name,
          password: bcrypt.hashSync(password, 10),
        }
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(ExceptionEnum.ACCOUNT_WITHOUT_PERMISSION);
    });

    it('비밀번호 오입력', async () => {
      await prismaService.user.create({
        data: {
          email, name,
          password: bcrypt.hashSync(password, 10),
          permissions: {
            connect: {
              name: PermissionEnum.CAN_LOGIN
            }
          }
        }
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: "password1" });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(ExceptionEnum.LOGIN_FAILED);
    });

    it('존재하지 않는 계정으로 로그인', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(ExceptionEnum.LOGIN_FAILED);
    });
  });


  describe('POST - /auth/logout', () => {
    it('로그아웃', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer()).post('/auth/logout')
    await app.close();
  });
});
