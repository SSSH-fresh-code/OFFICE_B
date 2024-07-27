import * as request from 'supertest';
import * as session from 'express-session';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import {PrismaService} from 'src/infrastructure/db/prisma.service';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from 'src/app.module';
import {PrismaClientExceptionFilter} from 'src/infrastructure/filter/exception/prisma-exception.filter';
import {PermissionEnum} from 'src/domain/permission/domain/permission.enum';
import {formatMessage} from 'src/infrastructure/util/message.util';
import {ExceptionEnum} from 'src/infrastructure/filter/exception/exception.enum';
import {CreateSeriesDto} from './dto/create-series.dto';
import {Topic} from '../../domain/topic/topic.entity';
import {UpdateSeriesDto} from './dto/update-series.dto';

describe('SeriesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let topic: Topic;
  let createDto: CreateSeriesDto;
  let su: string;
  let gu: string;

  const superUser = {
    email: 'super@super.com',
    password: bcrypt.hashSync('password', 10),
    name: 'super',
  };
  const guestUser = {
    email: 'guest@guest.com',
    password: bcrypt.hashSync('password', 10),
    name: 'guest',
  };

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
          connect: [
            {
              name: PermissionEnum.CAN_LOGIN,
            },
            {
              name: PermissionEnum.CAN_READ_BLOG,
            },
            {
              name: PermissionEnum.CAN_WRITE_BLOG,
            },
          ],
        },
      },
    });

    await prismaService.user.create({
      data: {
        ...guestUser,
        permissions: {
          connect: [
            {
              name: PermissionEnum.CAN_LOGIN,
            },
          ],
        },
      },
    });

    let response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({email: superUser.email, password: 'password'});

    su = response.headers['set-cookie'];

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({email: guestUser.email, password: 'password'});

    gu = response.headers['set-cookie'];
  });

  beforeEach(async () => {
    await prismaService.cleanDatabase(['Topic', 'Series']);

    const createTopic = await prismaService.topic.create({
      data: {
        name: 'topic',
      },
    });

    topic = Topic.of(createTopic);

    createDto = {
      name: 'series im',
      topicId: topic.id,
    };
  });

  describe('POST - /series', () => {
    it('시리즈 생성', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .post('/series')
        .set('Cookie', su)
        .send(createDto);

      expect(statusCode).toEqual(201);
      expect(body.id).toBeDefined();
      expect(body.name).toEqual(createDto.name.replaceAll(' ', '_'));
      expect(body.topic.id).toEqual(topic.id);
      expect(body.topic.name).toEqual(topic.name);
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();

      return;
    });

    it('시리즈 중복 생성', async () => {
      await prismaService.series.create({
        data: {
          name: createDto.name.replaceAll(' ', '_'),
          topicId: topic.id,
        },
      });

      const {statusCode, body} = await request(app.getHttpServer())
        .post('/series')
        .set('Cookie', su)
        .send(createDto);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(
        formatMessage(ExceptionEnum.ALREADY_EXISTS, {param: 'name'}),
      );

      return;
    });

    it('권한 없이 시리즈 생성', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .post('/series')
        .set('Cookie', gu)
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

      return;
    });

    it('로그인 없이 시리즈 생성', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .post('/series')
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

      return;
    });
  });

  describe('PUT - /series', () => {
    it('시리즈 이름 수정', async () => {
      const updateName = 'hello guys';
      const convertName = updateName.replaceAll(' ', '_');

      const {id} = await prismaService.series.create({
        data: {
          name: createDto.name.replaceAll(' ', '_'),
          topicId: topic.id,
        },
      });

      const dto: UpdateSeriesDto = {
        id,
        name: updateName,
      };

      const {statusCode, body} = await request(app.getHttpServer())
        .put('/series')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.name).toEqual(convertName);
      expect(body.topic.id).toEqual(topic.id);
      expect(body.topic.name).toEqual(topic.name);

      return;
    });

    it('시리즈 주제 수정', async () => {
      const anotherTopic = await prismaService.topic.create({
        data: {
          name: 'new_Topic!',
        },
      });

      const {id, name} = await prismaService.series.create({
        data: {
          name: createDto.name.replaceAll(' ', '_'),
          topicId: topic.id,
        },
      });

      const dto: UpdateSeriesDto = {
        id,
        topicId: anotherTopic.id,
      };

      const {statusCode, body} = await request(app.getHttpServer())
        .put('/series')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.name).toEqual(name);
      expect(body.topic.id).not.toEqual(topic.id);
      expect(body.topic.name).not.toEqual(topic.name);
      expect(body.topic.id).toEqual(anotherTopic.id);
      expect(body.topic.name).toEqual(anotherTopic.name);

      return;
    });

    it('시리즈 주제, 이름 동시 수정', async () => {
      const updateName = 'hello guys';
      const convertName = updateName.replaceAll(' ', '_');
      const anotherTopic = await prismaService.topic.create({
        data: {
          name: 'new_Topic!',
        },
      });

      const {id} = await prismaService.series.create({
        data: {
          name: createDto.name.replaceAll(' ', '_'),
          topicId: topic.id,
        },
      });

      const dto: UpdateSeriesDto = {
        id,
        name: updateName,
        topicId: anotherTopic.id,
      };

      const {statusCode, body} = await request(app.getHttpServer())
        .put('/series')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.name).toEqual(convertName);
      expect(body.topic.id).not.toEqual(topic.id);
      expect(body.topic.name).not.toEqual(topic.name);
      expect(body.topic.id).toEqual(anotherTopic.id);
      expect(body.topic.name).toEqual(anotherTopic.name);

      return;
    });

    it('이미 있는 데이터로 시리즈 수정', async () => {
      const updateName = 'hello guys';
      const convertName = updateName.replaceAll(' ', '_');

      await prismaService.series.create({
        data: {name: convertName, topicId: topic.id},
      });

      const {id} = await prismaService.series.create({
        data: {name: 'what', topicId: topic.id},
      });

      const dto: UpdateSeriesDto = {
        id,
        name: updateName,
      };

      const {statusCode, body} = await request(app.getHttpServer())
        .put('/series')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(
        formatMessage(ExceptionEnum.ALREADY_EXISTS, {param: 'name'}),
      );

      return;
    });

    it('권한 없이 시리즈 수정', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .put('/series')
        .set('Cookie', gu)
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

      return;
    });

    it('로그인 없이 시리즈 생성', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .put('/series')
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

      return;
    });
  });

  describe('DELETE - /series/:id', () => {
    it('시리즈 삭제', async () => {
      const {id} = await prismaService.series.create({
        data: createDto,
      });

      const {statusCode, body} = await request(app.getHttpServer())
        .delete(`/series/${id}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body).toEqual({});
    });

    it('존재 하지 않는 시리즈 삭제', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .delete(`/series/0`)
        .set('Cookie', su);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });

    it('권한 없이 시리즈 삭제', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .delete(`/series/0`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });
  });

  describe('GET - /series', () => {
    it('시리즈 목록 조회하기', async () => {
      const dto2: CreateSeriesDto = {
        name: '테스트 시리즈2',
        topicId: topic.id,
      };

      await prismaService.series.createMany({
        data: [createDto, dto2],
      });

      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series?page=1&take=10&orderby=name&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(2);
    });

    it('빈 목록 조회', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series?page=1&take=10&orderby=name&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(0);
    });

    it('주제 검색으로 목록 조회', async () => {
      const anotherTopic = await prismaService.topic.create({
        data: {
          name: 'new Topic!',
        },
      });

      const dto2: CreateSeriesDto = {
        name: 'what',
        topicId: anotherTopic.id,
      };

      await prismaService.series.createMany({
        data: [createDto, dto2],
      });

      const {statusCode, body} = await request(app.getHttpServer())
        .get(
          `/series?page=1&take=10&orderby=name&direction=desc&where__topicId=${anotherTopic.id}`,
        )
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
      expect(body.data[0].name).toEqual(dto2.name);
    });

    it('부분 검색으로 목록 조회', async () => {
      const dto2: CreateSeriesDto = {
        name: '테스트채팅2',
        topicId: topic.id,
      };

      await prismaService.series.createMany({
        data: [createDto, dto2],
      });

      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series?page=1&take=10&orderby=name&direction=desc&like__name=2`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('권한 없이 목록 조회', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series?page=1&take=10&orderby=name&direction=desc`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });
  });

  describe('GET - /series/:name', () => {
    it('시리즈 단건 조회하기', async () => {
      const {id, name} = await prismaService.series.create({
        data: {name: createDto.name.replaceAll(' ', '_'), topicId: topic.id},
      });

      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series/${encodeURI(name)}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(id);
      expect(body.name).toEqual(name);
    });

    it('존재 하지 않는 시리즈 조회', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series/none`)
        .set('Cookie', su);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });

    it('권한 없이 시리즈 조회', async () => {
      const {statusCode, body} = await request(app.getHttpServer())
        .get(`/series/none`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });
  });
});
