import {ConfigModule, ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {LoggerModule} from 'src/infrastructure/module/logger.module';
import {PrismaService} from '../prisma.service';
import {Prisma} from '@prisma/client';
import {Series} from 'src/domain/blog/domain/series/series.entity';
import {Topic} from 'src/domain/blog/domain/topic/topic.entity';
import {iSeries} from 'src/domain/blog/domain/series/series.interface';
import {iTopic} from 'src/domain/blog/domain/topic/topic.interface';
import {PrismaPostRepository} from './prisma-post.repository';
import {PostRepository} from 'src/domain/blog/infrastructure/post/post.repository';
import {iPost} from 'src/domain/blog/domain/post/post.interface';
import {iUser} from 'src/domain/user/domain/user.interface';
import {User} from 'src/domain/user/domain/user.entity';
import {Post} from 'src/domain/blog/domain/post/post.entity';

describe('PrismaPostRepository', () => {
  let repository: PostRepository;
  let prisma: PrismaService;
  let author: iUser;
  let topic: iTopic;
  let series: iSeries;
  let post: iPost;

  function hasDiffEntity(post1: iPost, post2: iPost) {
    for (const key of Object.keys(post1)) {
      if (key === '_updatedAt' || key === '_createdAt') continue;
      expect(post1[key]).toEqual(post2[key]);
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({isGlobal: true}), LoggerModule],
      providers: [PrismaService, PrismaPostRepository, ConfigService],
    }).compile();

    repository = module.get<PostRepository>(PrismaPostRepository);
    prisma = module.get<PrismaService>(PrismaService);

    const prismaUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'password',
        name: 'name',
      },
    });

    const prismaTopic = await prisma.topic.create({
      data: {
        name: 'topic',
      },
    });

    const prismaSeries = await prisma.series.create({
      data: {
        name: 'series',
        topicId: prismaTopic.id,
      },
    });

    author = User.of(prismaUser);
    topic = Topic.of(prismaTopic);
    series = Series.of(prismaSeries, topic);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({where: {id: {not: author.id}}});
    await prisma.topic.deleteMany({where: {id: {not: topic.id}}});
    await prisma.series.deleteMany({where: {id: {not: series.id}}});
    await prisma.cleanDatabase(['Post']);
    post = new Post(
      0,
      '제목 입니다.',
      '내용입니다',
      author,
      topic,
      series,
      '0001.avif',
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const convertName = (str: string) => str.replaceAll(' ', '_');

  describe('save', () => {
    it('Post를 생성합니다.', async () => {
      const p = await repository.save(post);

      expect(p.id).not.toEqual(post.id);
      expect(p.title).toEqual(convertName(post.title));
      expect(p.content).toEqual(post.content);
      expect(p.thumbnail).toEqual(post.thumbnail);
      expect(p.author.id).toEqual(post.author.id);
      expect(p.topic.id).toEqual(post.topic.id);
      expect(p.series.id).toEqual(post.series.id);
    });

    it('시리즈 없는 Post를 생성합니다.', async () => {
      post = new Post(
        0,
        '제목 입니다.',
        '내용입니다',
        author,
        topic,
        undefined,
        '0001.avif',
      );
      const p = await repository.save(post);

      expect(p.id).not.toEqual(post.id);
      expect(p.title).toEqual(convertName(post.title));
      expect(p.content).toEqual(post.content);
      expect(p.thumbnail).toEqual(post.thumbnail);
      expect(p.author.id).toEqual(post.author.id);
      expect(p.topic.id).toEqual(post.topic.id);
      expect(p.series).toBeNull();
    });

    it('썸네일 없는 Post를 생성합니다.', async () => {
      post = new Post(0, '제목 입니다.', '내용입니다', author, topic, series);
      const p = await repository.save(post);

      expect(p.id).not.toEqual(post.id);
      expect(p.title).toEqual(convertName(post.title));
      expect(p.content).toEqual(post.content);
      expect(p.thumbnail).toBeNull();
      expect(p.author.id).toEqual(post.author.id);
      expect(p.topic.id).toEqual(post.topic.id);
      expect(p.series.id).toEqual(post.series.id);
    });

    it('썸네일, 시리즈 없는 Post를 생성합니다.', async () => {
      post = new Post(0, '제목 입니다.', '내용입니다', author, topic);
      const p = await repository.save(post);

      expect(p.id).not.toEqual(post.id);
      expect(p.title).toEqual(convertName(post.title));
      expect(p.content).toEqual(post.content);
      expect(p.thumbnail).toBeNull();
      expect(p.author.id).toEqual(post.author.id);
      expect(p.topic.id).toEqual(post.topic.id);
      expect(p.series).toBeNull();
    });

    it('이미 존재하는 제목으로 Post를 생성합니다.', async () => {
      await repository.save(post);

      await expect(() => repository.save(post)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('findById', () => {
    it('id로 Post를 조회합니다.', async () => {
      const savedPost = await repository.save(post);

      const p = await repository.findById(savedPost.id);

      hasDiffEntity(savedPost, p);
    });

    it('존재하지 않는 Post를 조회합니다.', async () => {
      await expect(() => repository.findById(1)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('findByTitle', () => {
    it('title으로 Post를 조회합니다.', async () => {
      const savedPost = await repository.save(post);

      const p = await repository.findByTitle(savedPost.title);

      hasDiffEntity(savedPost, p);
    });

    it('존재하지 않는 Post를 조회합니다.', async () => {
      await expect(() => repository.findByTitle('Wrong')).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('update', () => {
    it('Post 제목, 내용을 수정합니다.', async () => {
      const savedPost = await repository.save(post);

      const updateName = savedPost.title + '2';

      savedPost.title = updateName;
      savedPost.content = '수정된 내용 입니다.';

      const updatedPost = await repository.update(savedPost);

      hasDiffEntity(updatedPost, savedPost);
      expect(updatedPost.title).not.toEqual(post.title);
      expect(updatedPost.content).not.toEqual(post.content);
    });

    it('Post 주제, 시리즈를 수정합니다.', async () => {
      const anotherPrismaTopic = await prisma.topic.create({
        data: {
          name: 'topic2',
        },
      });

      const anotherPrismaSeries = await prisma.series.create({
        data: {
          name: 'series2',
          topicId: anotherPrismaTopic.id,
        },
      });

      const anotherTopic = Topic.of(anotherPrismaTopic);
      const anotherSeries = Series.of(anotherPrismaSeries);

      const savedPost = await repository.save(post);

      savedPost.topic = anotherTopic;
      savedPost.series = anotherSeries;

      const updatedPost = await repository.update(savedPost);

      hasDiffEntity(updatedPost, savedPost);
      expect(updatedPost.topic.id).not.toEqual(post.topic.id);
      expect(updatedPost.series.id).not.toEqual(post.series.id);
    });

    it('Post 시리즈를 없앱니다.', async () => {
      const savedPost = await repository.save(post);

      savedPost.series = null;

      const updatedPost = await repository.update(savedPost);

      expect(updatedPost.series).toBeNull();
    });

    it('Post 작성자를 수정합니다.', async () => {
      const anotherPrismaUser = await prisma.user.create({
        data: {
          email: 'newUser@test.com',
          password: 'pwwpwpwpwppwp',
          name: 'newName',
        },
      });

      const anotherUser = User.of(anotherPrismaUser);

      const savedPost = await repository.save(post);

      savedPost.author = anotherUser;

      const updatedPost = await repository.update(savedPost);

      hasDiffEntity(updatedPost, savedPost);
      expect(updatedPost.author.id).not.toEqual(post.author.id);
    });

    it('이미 존재하는 이름으로 Post를 수정합니다.', async () => {
      const anotherPostEntity = new Post(
        0,
        'Test',
        '내용2입니다',
        author,
        topic,
        series,
        '0002.avif',
      );
      const postForUpdate = await repository.save(anotherPostEntity);

      const savedPost = await repository.save(post);

      savedPost.title = postForUpdate.title;

      await expect(() => repository.update(savedPost)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });

    it('존재하지 않는 Post를 수정합니다.', async () => {
      await expect(() => repository.update(post)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('delete', () => {
    it('Post를 삭제합니다.', async () => {
      const savedPost = await repository.save(post);

      expect(() => repository.delete(savedPost.id)).resolves;
    });

    it('존재하지 않는 Post를 삭제합니다.', async () => {
      await expect(() => repository.delete(post.id)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });
});
