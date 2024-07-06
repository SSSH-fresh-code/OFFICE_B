import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/db/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import * as session from 'express-session';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import { PrismaClientExceptionFilter } from '../../../infrastructure/filter/exception/prisma-exception.filter';
import { PermissionEnum } from '../../../domain/permission/domain/permission.enum';
import { formatMessage } from '../../../infrastructure/util/message.util';
import { ExceptionEnum } from '../../../infrastructure/filter/exception/exception.enum';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let su: string;
  let gu: string;

  const createDto: CreatePermissionDto = {
    name: "TEST001",
    description: "테스트를 위한 권한입니다."
  }

  const superUser = {
    email: "super@super.com",
    password: bcrypt.hashSync("password", 10),
    name: "super"
  }
  const guestUser = {
    email: "guest@guest.com",
    password: bcrypt.hashSync("password", 10),
    name: "guest"
  }

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

    await prismaService.user.create({
      data: {
        ...superUser,
        permissions: {
          connect: [{
            name: PermissionEnum.CAN_LOGIN
          }, {
            name: PermissionEnum.CAN_WRITE_PERMISSION
          }, {
            name: PermissionEnum.CAN_READ_PERMISSION
          }]
        }
      }
    });

    await prismaService.user.create({
      data: {
        ...guestUser,
        permissions: {
          connect: [{
            name: PermissionEnum.CAN_LOGIN
          }]
        }
      }
    });

    let response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: superUser.email, password: "password" });

    su = response.headers['set-cookie'];

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: guestUser.email, password: "password" });

    gu = response.headers['set-cookie'];
  });

  beforeEach(async () => {
    await prismaService.cleanDatabase(['Permission']);
  });

  describe('POST - /permission', () => {
    it('권한 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/permission')
        .set('Cookie', su)
        .send(createDto);

      expect(statusCode).toEqual(201);
      expect(body.name).toEqual(createDto.name);
      expect(body.description).toEqual(createDto.description);

      return;
    });

    it('권한 중복 생성', async () => {
      await prismaService.permission.create({
        data: createDto
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/permission')
        .set('Cookie', su)
        .send(createDto);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "name" }))

      return;
    });

    it('권한 없이 권한 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/permission')
        .set('Cookie', gu)
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

      return;
    });
    it('로그인 없이 권한 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/permission')
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

      return;
    });
  });

  describe('DELETE - /permission', () => {
    it('권한 삭제', async () => {
      const { name } = await prismaService.permission.create({
        data: createDto
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .delete(`/permission/${name}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body).toEqual({});
    });


    it('존재 하지 않는 권한 삭제', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .delete(`/permission/WRONG001`)
        .set('Cookie', su);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });

    it('권한 없이 권한 삭제', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .delete(`/permission/FAKE0001`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });
  });

  describe('GET - /permission', () => {
    it('권한 목록 조회하기', async () => {
      const dto2: CreatePermissionDto = {
        name: "TEST0002",
        description: "테스트권한2"
      };

      await prismaService.permission.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/permission`)
        .set('Cookie', su);


      expect(statusCode).toEqual(200);
      expect(body.length).toEqual(2);
    });

    it('권한 없이 목록 조회', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/permission`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });
  });

  describe('PUT - /permission', () => {
    it('권한 수정하기', async () => {
      const { name } = await prismaService.permission.create({
        data: createDto
      });
      const updateDto: UpdatePermissionDto = {
        name,
        description: "수정한권한1"
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put(`/permission`)
        .set('Cookie', su)
        .send(updateDto);

      expect(statusCode).toEqual(200);
      expect(body.description).toEqual(updateDto.description);
    });

    it('존재하지 않는 수정하기', async () => {
      const updateDto: UpdatePermissionDto = {
        name: "WRONG001",
        description: "수정한권한1"
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put(`/permission`)
        .set('Cookie', su)
        .send(updateDto);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });


    it('권한 없이 권한 수정', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .put(`/permission`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });

    it('로그인 없이 권한 수정', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .put(`/permission`);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);
    });
  });

  describe('GET - /permission/:name', () => {
    it('권한 단건 조회', async () => {
      const { name, description } = await prismaService.permission.create({
        data: createDto
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/permission/${name}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.name).toEqual(name);
      expect(body.description).toEqual(description);
    });

    it('존재하지 않는 권한 단건 조회', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/permission/WRONG001`)
        .set('Cookie', su);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });

    it('권한없이 권한 단건 조회', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/permission/WRONG001`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });

    it('로그인 없이 권한 단건 조회', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/permission/WRONG001`);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);
    });
  })
})
