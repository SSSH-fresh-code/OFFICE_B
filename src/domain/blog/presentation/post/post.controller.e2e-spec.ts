import * as request from 'supertest';
import * as session from 'express-session';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaClientExceptionFilter } from 'src/infrastructure/filter/exception/prisma-exception.filter';
import { PermissionEnum } from 'src/domain/permission/domain/permission.enum';
import { Topic } from '../../domain/topic/topic.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/domain/user/domain/user.entity';
import { formatMessage } from 'src/infrastructure/util/message.util';
import { ExceptionEnum } from 'src/infrastructure/filter/exception/exception.enum';
import { Series } from '../../domain/series/series.entity';
import { UpdatePostDto } from './dto/update-post.dto';

describe('SeriesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let author: User;
  let topic: Topic;
  let series: Series;
  let createDto: CreatePostDto;
  let su: string;
  let gu: string;

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

    const createUser = await prismaService.user.create({
      data: {
        ...superUser,
        permissions: {
          connect: [{
            name: PermissionEnum.CAN_LOGIN
          }, {
            name: PermissionEnum.CAN_READ_BLOG
          }, {
            name: PermissionEnum.CAN_WRITE_BLOG
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
    author = User.of(createUser);

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: guestUser.email, password: "password" });

    gu = response.headers['set-cookie'];
  });

  beforeEach(async () => {
    await prismaService.cleanDatabase(['Topic', 'Series', 'Post']);

    const createTopic = await prismaService.topic.create({
      data: {
        name: "topic"
      }
    });

    const createSeries = await prismaService.series.create({
      data: {
        name: "topic"
        , topicId: createTopic.id
      }
    });

    topic = Topic.of(createTopic);
    series = Series.of(createSeries);

    createDto = {
      title: "post test",
      content: "test content",
      authorName: author.name,
      topicId: topic.id,
      seriesId: series.id,
      thumbnail: "0001.avif"
    }
  });

  describe('POST - /post', () => {

    it('게시글 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/post')
        .set('Cookie', su)
        .send(createDto);

      expect(statusCode).toEqual(201);
      expect(body.id).toBeDefined();
      expect(body.title).toEqual(createDto.title.replaceAll(" ", "_"));
      expect(body.content).toEqual(createDto.content);
      expect(body.thumbnail).toEqual(createDto.thumbnail);
      expect(body.author.id).toEqual(author.id);
      expect(body.author.name).toEqual(author.name);
      expect(body.topic.id).toEqual(topic.id);
      expect(body.topic.name).toEqual(topic.name);
      expect(body.series.id).toEqual(series.id);
      expect(body.series.name).toEqual(series.name);
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();

      return;
    });

    it('시리즈, 썸네일 없는 게시글 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/post')
        .set('Cookie', su)
        .send({
          title: createDto.title,
          content: createDto.content,
          authorName: author.name,
          topicId: topic.id
        });

      expect(statusCode).toEqual(201);
      expect(body.id).toBeDefined();
      expect(body.title).toEqual(createDto.title.replaceAll(" ", "_"));
      expect(body.content).toEqual(createDto.content);
      expect(body.thumbnail).toBeNull();
      expect(body.author.id).toEqual(author.id);
      expect(body.author.name).toEqual(author.name);
      expect(body.topic.id).toEqual(topic.id);
      expect(body.topic.name).toEqual(topic.name);
      expect(body.series).toBeNull();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();

      return;
    });

    it('게시글 중복 생성', async () => {
      await prismaService.post.create({
        data: { ...createDto, title: createDto.title.replaceAll(" ", "_") }
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/post')
        .set('Cookie', su)
        .send(createDto);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "title" }))

      return;
    });

    it('권한 없이 게시글 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/post')
        .set('Cookie', gu)
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

      return;
    });

    it('로그인 없이 게시글 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/post')
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

      return;
    });
  });

  describe('PUT - /post', () => {
    it('게시글 제목, 내용, 썸네일 수정', async () => {
      const updateTitle = "update Title";
      const convertTitle = updateTitle.replaceAll(" ", "_");
      const updateContent = "수정한 내용";
      const updateThumbnail = "0003.avif";

      const { id } = await prismaService.post.create({
        data: { ...createDto, title: createDto.title.replaceAll(" ", "_") }
      });

      const dto: UpdatePostDto = {
        id, title: updateTitle, content: updateContent, thumbnail: updateThumbnail
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.title).toEqual(convertTitle);
      expect(body.content).toEqual(updateContent);
      expect(body.thumbnail).toEqual(updateThumbnail);

      return;
    });

    it('게시글 주제 수정', async () => {
      const anotherTopic = await prismaService.topic.create({
        data: {
          name: "new_Topic!"
        }
      })

      const { id, topic } = await prismaService.post.create({
        data: createDto,
        include: { topic: true }
      });

      const dto: UpdatePostDto = {
        id, topicId: anotherTopic.id
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.topic.id).not.toEqual(topic.id);
      expect(body.topic.name).not.toEqual(topic.name);
      expect(body.topic.id).toEqual(anotherTopic.id);
      expect(body.topic.name).toEqual(anotherTopic.name);

      return;
    });

    it('게시글 시리즈 수정', async () => {
      const anotherSeries = await prismaService.series.create({
        data: {
          name: "new_series!",
          topicId: topic.id
        }
      })

      const { id, series } = await prismaService.post.create({
        data: createDto,
        include: { series: true }
      });

      const dto: UpdatePostDto = {
        id, seriesId: anotherSeries.id
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.series.id).not.toEqual(series.id);
      expect(body.series.name).not.toEqual(series.name);
      expect(body.series.id).toEqual(anotherSeries.id);
      expect(body.series.name).toEqual(anotherSeries.name);

      return;
    });

    it('게시글 시리즈 삭제(=수정)', async () => {
      const { id, series } = await prismaService.post.create({
        data: createDto,
        include: { series: true }
      });

      const dto: UpdatePostDto = {
        id, seriesId: null
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.series).toBeNull();

      return;
    });

    it('게시글 저자 수정', async () => {
      const anotherUser = await prismaService.user.create({
        data: {
          email: author.email + "2",
          password: author.password,
          name: author.name + "2"
        }
      })

      const post = await prismaService.post.create({
        data: createDto,
        include: { author: true }
      });

      const dto: UpdatePostDto = {
        id: post.id, authorName: anotherUser.name
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(dto.id);
      expect(body.author.id).not.toEqual(author.id);
      expect(body.author.name).not.toEqual(author.name);
      expect(body.author.id).toEqual(anotherUser.id);
      expect(body.author.name).toEqual(anotherUser.name);

      return;
    });

    it('이미 있는 제목으로 게시글 수정', async () => {
      const title = "title";

      await prismaService.post.create({
        data: {
          ...createDto, title: title
        }
      });

      const { id } = await prismaService.post.create({
        data: { ...createDto, title: "anotherTitle" }
      });

      const dto: UpdatePostDto = {
        id, title: title
      }

      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', su)
        .send(dto);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "title" }))

      return;
    });

    it('권한 없이 게시글 수정', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .set('Cookie', gu)
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

      return;
    });

    it('로그인 없이 게시글 생성', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .put('/post')
        .send(createDto);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

      return;
    });
  });

  describe('DELETE - /post/:id', () => {
    it('게시글 삭제', async () => {
      const { id } = await prismaService.post.create({
        data: createDto
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .delete(`/post/${id}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body).toEqual({});
    });

    it('존재 하지 않는 게시글 삭제', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .delete(`/post/0`)
        .set('Cookie', su);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });

    it('권한 없이 게시글 삭제', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .delete(`/post/0`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(403);
      expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
    });
  });

  describe('GET - /post', () => {
    it('게시글 목록 조회하기', async () => {
      const dto2: CreatePostDto = {
        title: "test2",
        content: "test content",
        authorName: author.name,
        topicId: topic.id,
        seriesId: series.id,
        thumbnail: "0003.avif"
      };

      await prismaService.post.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(2);
    });

    it('제목 필터링으로 목록 조회하기', async () => {
      const dto2: CreatePostDto = {
        title: "test2",
        content: "test content",
        authorName: author.name,
        topicId: topic.id,
        seriesId: series.id,
        thumbnail: "0003.avif"
      };

      await prismaService.post.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?like__title=${dto2.title}&page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('내용 필터링으로 목록 조회하기', async () => {
      const dto2: CreatePostDto = {
        title: "test2",
        content: "hello nice",
        authorName: author.name,
        topicId: topic.id,
        seriesId: series.id,
        thumbnail: "0003.avif"
      };

      await prismaService.post.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?like__content=nice&page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('주제로 필러팅하여 목록 조회하기', async () => {
      const anotherTopic = await prismaService.topic.create({
        data: {
          name: "new Topic!"
        }
      });

      const dto2: CreatePostDto = {
        title: "test2",
        content: "hello nice",
        authorName: author.name,
        topicId: anotherTopic.id,
        seriesId: series.id,
        thumbnail: "0003.avif"
      };

      await prismaService.post.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?where__topicId=${anotherTopic.id}&page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('시리즈로 필터링하여 목록 조회하기', async () => {
      const anotherSeries = await prismaService.series.create({
        data: {
          name: "new Series!",
          topicId: topic.id
        }
      });

      const dto2: CreatePostDto = {
        title: "test2",
        content: "hello nice",
        authorName: author.name,
        topicId: topic.id,
        seriesId: anotherSeries.id,
        thumbnail: "0003.avif"
      };

      await prismaService.post.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?where__seriesId=${anotherSeries.id}&page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('유저로 필터링하여 목록 조회하기', async () => {
      const anotherUser = await prismaService.user.create({
        data: {
          email: author.email + "3",
          password: author.password,
          name: author.name + "3"
        }
      })

      const dto2: CreatePostDto = {
        title: "test2",
        content: "hello nice",
        authorName: anotherUser.name,
        topicId: topic.id,
        seriesId: series.id,
        thumbnail: "0003.avif"
      };

      await prismaService.post.createMany({
        data: [createDto, dto2]
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?where__authorName=${anotherUser.name}&page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('빈 목록 조회', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(0);
    });

    it('권한 없이 목록 조회', async () => {
      await prismaService.post.create({ data: createDto });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?page=1&take=10&orderby=id&direction=desc`)
        .set('Cookie', gu);

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });

    it('로그인 없이 목록 조회', async () => {
      await prismaService.post.create({ data: createDto });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post?page=1&take=10&orderby=id&direction=desc`)

      expect(statusCode).toEqual(200);
      expect(body.data.length).toEqual(1);
    });
  });

  describe('GET - /post/:title', () => {
    it('게시글 단건 조회하기', async () => {
      const { id, title } = await prismaService.post.create({
        data: { ...createDto, title: createDto.title.replaceAll(" ", "_") }
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post/${encodeURI(title)}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(id);
      expect(body.title).toEqual(title);
    });

    it('띄어쓰기로 게시글 단건 조회하기', async () => {
      const { id, title } = await prismaService.post.create({
        data: { ...createDto, title: createDto.title.replaceAll(" ", "_") }
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post/${encodeURI(createDto.title)}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(id);
      expect(body.title).toEqual(title);
    });

    it('존재 하지 않는 게시글 조회', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post/none`)
        .set('Cookie', su);

      expect(statusCode).toEqual(400);
      expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
    });

    it('권한 없이 게시글 조회', async () => {
      const { id, title } = await prismaService.post.create({
        data: { ...createDto, title: createDto.title.replaceAll(" ", "_") }
      });

      const { statusCode, body } = await request(app.getHttpServer())
        .get(`/post/${encodeURI(title)}`)
        .set('Cookie', su);

      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(id);
      expect(body.title).toEqual(title);
    });
  });
})
