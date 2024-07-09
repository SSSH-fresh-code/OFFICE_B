import { PagingService } from "src/infrastructure/common/services/paging.service";
import { TopicRepository } from "../../infrastructure/topic/topic.repository";
import { Topic } from "@prisma/client";
import { iTopicService } from "./topic.service.interface";
import { Test, TestingModule } from "@nestjs/testing";
import { TopicService } from "./topic.service";
import { TOPIC_REPOSITORY } from "../../blog.const";
import { UserService } from "src/domain/user/application/user.service";

const mockTopicRepository = (): TopicRepository => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const mockPagingService = () => ({
  getPagedResults: jest.fn()
});

describe('TopicService', () => {
  let topicService: iTopicService;
  let repository: TopicRepository;
  let pagingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        { provide: TOPIC_REPOSITORY, useFactory: mockTopicRepository },
        { provide: PagingService, useFactory: mockPagingService }
      ]
    }).compile();

    topicService = module.get<TopicService>(TopicService);
    repository = module.get<TopicRepository>(TOPIC_REPOSITORY);
    pagingService = module.get<PagingService<Topic>>(PagingService);
  });

  describe('getTopicByName', () => {
    it('정상적으로 name으로 주제를 조회합니다.', async () => {

    });

    it('존재하지 않는 name으로 주제를 조회합니다.', async () => {

    });
  });

  describe('getTopics', () => {
    it('topic list를 조회합니다.', async () => {

    });

    it('name을 like로 검색하여 조회합니다.', async () => {

    });
  });

  describe('createTopic', () => {
    it('토픽을 생성합니다.', async () => {

    });
  });

  describe('updateTopic', () => {
    it('토픽을 수정합니다.', async () => {

    });
  });

  describe('deleteTopic', () => {
    it('토픽을 삭제합니다.', async () => {

    });
  });
});
