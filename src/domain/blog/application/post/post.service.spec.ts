import {PagingService} from 'src/infrastructure/common/services/paging.service';
import {Test, TestingModule} from '@nestjs/testing';
import {Topic} from '../../domain/topic/topic.entity';
import {SeriesRepository} from '../../infrastructure/series/series.repository';
import {iPagingService} from 'src/infrastructure/common/services/paging.interface';
import {
  POST_REPOSITORY,
  POST_SERVICE,
  SERIES_REPOSITORY,
  TOPIC_REPOSITORY,
} from '../../blog.const';
import {TopicRepository} from '../../infrastructure/topic/topic.repository';
import {PostRepository} from '../../infrastructure/post/post.repository';
import {iPostService} from './post.service.interface';
import {PostService} from './post.service';
import {Series} from '../../domain/series/series.entity';
import {ofPost, Post} from '../../domain/post/post.entity';
import {User} from 'src/domain/user/domain/user.entity';
import {PagingPostDto} from '../../presentation/post/dto/paging-post.dto';
import {CreatePostDto} from '../../presentation/post/dto/create-post.dto';
import {UserRepository} from 'src/domain/user/infrastructure/user.repository';
import {USER_REPOSITORY} from 'src/domain/user/user.const';
import {UpdatePostDto} from '../../presentation/post/dto/update-post.dto';
import {ExceptionEnum} from 'src/infrastructure/filter/exception/exception.enum';

const mockPostRepository = (): PostRepository => ({
  findById: jest.fn(),
  findByTitle: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockTopicRepository = (): TopicRepository => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockSeriesRepository = (): SeriesRepository => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findAllByTopicId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUserRepository = (): UserRepository => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  getPermissionByUser: jest.fn(),
  setPermission: jest.fn(),
});

const mockPagingService = (): iPagingService => ({
  getPagedResults: jest.fn(),
});

describe('PostSerivce', () => {
  let postService: iPostService;
  let repository: jest.Mocked<PostRepository>;
  let seriesRepository: jest.Mocked<SeriesRepository>;
  let topicRepository: jest.Mocked<TopicRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let pagingService: jest.Mocked<iPagingService>;

  let user: User;
  let topic: Topic;
  let series: Series;
  let post: Post;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {provide: POST_SERVICE, useClass: PostService},
        {provide: POST_REPOSITORY, useFactory: mockPostRepository},
        {provide: SERIES_REPOSITORY, useFactory: mockSeriesRepository},
        {provide: TOPIC_REPOSITORY, useFactory: mockTopicRepository},
        {provide: USER_REPOSITORY, useFactory: mockUserRepository},
        {provide: PagingService, useFactory: mockPagingService},
      ],
    }).compile();

    postService = module.get<PostService>(POST_SERVICE);
    repository = module.get<jest.Mocked<PostRepository>>(POST_REPOSITORY);
    seriesRepository =
      module.get<jest.Mocked<SeriesRepository>>(SERIES_REPOSITORY);
    topicRepository =
      module.get<jest.Mocked<TopicRepository>>(TOPIC_REPOSITORY);
    userRepository = module.get<jest.Mocked<UserRepository>>(USER_REPOSITORY);
    pagingService = module.get<jest.Mocked<iPagingService>>(PagingService);
  });

  beforeEach(() => {
    user = new User('mmm-mm-mmmm', 'email@test.com', 'password', 'name', []);
    topic = new Topic(1, 'topic');
    series = new Series(1, 'series', topic);
    post = new Post(1, 'title', 'content', user, topic, series, '0001.avif');
  });

  describe('getPostById', () => {
    it('id로 게시글을 조회합니다.', async () => {
      repository.findById.mockResolvedValue(post);

      const result = await postService.getPostById(post.id);

      expect(result).toEqual(post.toDto());
      expect(repository.findById).toHaveBeenCalledWith(post.id);
    });
  });

  describe('getPostByTitle', () => {
    it('title로 게시글을 조회합니다.', async () => {
      repository.findByTitle.mockResolvedValue(post);

      const result = await postService.getPostByTitle(post.title);

      expect(result).toEqual(post.toDto());
      expect(repository.findByTitle).toHaveBeenCalledWith(post.title);
    });

    it('공백이 있는 제목으로 게시글을 조회합니다.', async () => {
      const title = '인생은 즐거워';
      const convertTitle = title.replaceAll(' ', '_');

      repository.findByTitle.mockResolvedValue(post);

      const result = await postService.getPostByTitle(title);

      expect(result).toEqual(post.toDto());
      expect(repository.findByTitle).toHaveBeenCalledWith(convertTitle);
    });
  });

  describe('getPosts', () => {
    it('post list를 조회합니다.', async () => {
      const prismaUser = {
        id: 'mmm-mm-mmmm',
        email: 'email@email.com',
        password: 'password',
        name: 'name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prismaTopic = {
        id: 1,
        name: 'name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prismaSeries = {
        id: 1,
        name: 'name',
        topicId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prismaPost: ofPost = {
        id: 1,
        title: 'title',
        content: 'content',
        authorName: prismaUser.name,
        topicId: prismaTopic.id,
        seriesId: prismaSeries.id,
        author: prismaUser,
        topic: prismaTopic,
        series: prismaSeries,
        thumbnail: '0001.avif',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto: PagingPostDto = {
        page: 1,
        take: 10,
        orderby: 'id',
        direction: 'desc',
      };

      pagingService.getPagedResults.mockResolvedValue({
        data: [prismaPost],
        info: {
          total: 1,
          current: dto.page,
          take: dto.take,
          last: 1,
        },
      });

      const result = await postService.getPosts(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith('Post', dto);
      expect(result.info.total).toEqual(1);
      expect(result.data).toEqual([Post.of(prismaPost).toDto()]);
    });
  });

  describe('createPost', () => {
    it('게시글을 생성합니다.', async () => {
      const dto: CreatePostDto = {
        title: post.title,
        content: post.content,
        authorName: post.author.name,
        topicId: post.topic.id,
        seriesId: post.series.id,
        thumbnail: post.thumbnail,
      };

      repository.save.mockResolvedValue(post);

      const result = await postService.createPost(dto);

      expect(result).toEqual(post.toDto());
      expect(repository.save).toHaveBeenCalledWith(
        new Post(
          0,
          dto.title,
          dto.content,
          new User('', '', '', dto.authorName),
          new Topic(dto.topicId, ''),
          new Series(dto.seriesId, '', new Topic(dto.topicId, '')),
          dto.thumbnail,
        ),
      );
    });

    it('시리즈 없는 게시글을 생성합니다.', async () => {
      const dto: CreatePostDto = {
        title: post.title,
        content: post.content,
        authorName: post.author.name,
        topicId: post.topic.id,
        thumbnail: post.thumbnail,
      };

      repository.save.mockResolvedValue(post);

      const result = await postService.createPost(dto);

      expect(result).toEqual(post.toDto());
      expect(repository.save).toHaveBeenCalledWith(
        new Post(
          0,
          dto.title,
          dto.content,
          new User('', '', '', dto.authorName),
          new Topic(dto.topicId, ''),
          null,
          dto.thumbnail,
        ),
      );
    });
  });

  describe('updatePost', () => {
    it('title을 수정합니다.', async () => {
      const dto: UpdatePostDto = {
        id: post.id,
        title: '제목 입니다.',
      };

      const updatedPost = new Post(
        post.id,
        dto.title,
        post.content,
        post.author,
        post.topic,
        post.series,
        post.thumbnail,
      );

      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.title).toEqual(dto.title.replaceAll(' ', '_'));
    });

    it('content을 수정합니다.', async () => {
      const dto: UpdatePostDto = {
        id: post.id,
        content: 'Updated',
      };

      const updatedPost = new Post(
        post.id,
        post.title,
        dto.content,
        post.author,
        post.topic,
        post.series,
        post.thumbnail,
      );

      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.content).toEqual(dto.content);
    });

    it('thumbnail을 수정합니다.', async () => {
      const dto: UpdatePostDto = {
        id: post.id,
        thumbnail: '0003.avif',
      };

      const updatedPost = new Post(
        post.id,
        post.title,
        post.content,
        post.author,
        post.topic,
        post.series,
        dto.thumbnail,
      );

      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.thumbnail).toEqual(dto.thumbnail);
    });

    it('author을 수정합니다.', async () => {
      const newAuthor = new User('', '', '', 'newAuthor');

      const dto: UpdatePostDto = {
        id: post.id,
        authorName: newAuthor.name,
      };

      const updatedPost = new Post(
        post.id,
        post.title,
        post.content,
        newAuthor,
        post.topic,
        post.series,
        post.thumbnail,
      );

      userRepository.findByName.mockResolvedValue(newAuthor);
      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.author.name).toEqual(dto.authorName);
    });

    it('topic을 수정합니다.', async () => {
      const newTopic = new Topic(999, 'topic999');

      const dto: UpdatePostDto = {
        id: post.id,
        topicId: newTopic.id,
      };

      const updatedPost = new Post(
        post.id,
        post.title,
        post.content,
        post.author,
        newTopic,
        post.series,
        post.thumbnail,
      );

      topicRepository.findById.mockResolvedValue(newTopic);
      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.topic.id).toEqual(dto.topicId);
    });

    it('series를 수정합니다.', async () => {
      const newSeries = new Series(999, 'series999', topic);

      const dto: UpdatePostDto = {
        id: post.id,
        seriesId: newSeries.id,
      };

      const updatedPost = new Post(
        post.id,
        post.title,
        post.content,
        post.author,
        post.topic,
        newSeries,
        post.thumbnail,
      );

      seriesRepository.findById.mockResolvedValue(newSeries);
      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.series.id).toEqual(dto.seriesId);
    });

    it('series를 삭제합니다.', async () => {
      const dto: UpdatePostDto = {
        id: post.id,
        seriesId: null,
      };

      const updatedPost = new Post(
        post.id,
        post.title,
        post.content,
        post.author,
        post.topic,
        null,
        post.thumbnail,
      );

      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      repository.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(dto);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedPost);
      expect(result).not.toEqual(post.toDto());
      expect(result).toEqual(updatedPost.toDto());
      expect(result.series).toBeNull();
    });

    it('기존 내용과 같으면 에러를 반환합니다.', async () => {
      const dto: UpdatePostDto = {
        id: post.id,
        title: post.title,
      };

      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      await expect(() => postService.updatePost(dto)).rejects.toThrow(
        ExceptionEnum.NOT_MODIFIED,
      );
    });

    it('수정 내용이 없다면 에러를 반환합니다.', async () => {
      const dto: UpdatePostDto = {
        id: post.id,
      };

      repository.findById.mockResolvedValue(
        new Post(
          post.id,
          post.title,
          post.content,
          post.author,
          post.topic,
          post.series,
          post.thumbnail,
        ),
      );

      await expect(() => postService.updatePost(dto)).rejects.toThrow(
        ExceptionEnum.NOT_MODIFIED,
      );
    });
  });

  describe('deletePost', () => {
    it('Post를 삭제합니다.', async () => {
      repository.delete.mockResolvedValue();

      await postService.deletePost(0);
    });
  });
});
