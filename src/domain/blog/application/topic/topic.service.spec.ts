import { PagingService } from "src/infrastructure/common/services/paging.service";
import { TopicRepository } from "../../infrastructure/topic/topic.repository";
import { iTopicService } from "./topic.service.interface";
import { Test, TestingModule } from "@nestjs/testing";
import { TopicService } from "./topic.service";
import { TOPIC_REPOSITORY } from "../../blog.const";
import { CreateTopicDto } from "../../presentation/topic/dto/create-topic.dto";
import { UpdateTopicDto } from "../../presentation/topic/dto/update-topic.dto";
import { Topic } from "../../domain/topic/topic.entity";
import { PagingTopicDto } from "../../presentation/topic/dto/paging-topic.dto";

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
  let repository: jest.Mocked<TopicRepository>;
  let pagingService;
  let topic: Topic;

  const createDto: CreateTopicDto = {
    name: "Test Topic"
  }

  const updateDto: UpdateTopicDto = {
    id: 1,
    name: "Test Topic2"
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        { provide: TOPIC_REPOSITORY, useFactory: mockTopicRepository },
        { provide: PagingService, useFactory: mockPagingService }
      ]
    }).compile();

    topicService = module.get<TopicService>(TopicService);
    repository = module.get<jest.Mocked<TopicRepository>>(TOPIC_REPOSITORY);
    pagingService = module.get<PagingService<Topic>>(PagingService);
  });

  beforeEach(() => { topic = new Topic(updateDto.id, createDto.name) })

  describe('getTopicByName', () => {
    it('정상적으로 name으로 주제를 조회합니다.', async () => {
      repository.findByName.mockResolvedValue(topic);

      const name = topic.name;

      const result = await topicService.getTopicByName(name);

      expect(result).toEqual(topic.toDto());
      expect(repository.findByName).toHaveBeenCalledWith(name);
    });
  });

  describe('getTopics', () => {
    it('topic list를 조회합니다.', async () => {
      const dto: PagingTopicDto = {
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [topic], total: 1
      });

      const result = await topicService.getTopics(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'Topic'
        , dto
        , {}
        , { createdAt: 'desc' }
      )
      expect(result.total).toEqual(1);
    });

    it('name을 like로 검색하여 조회합니다.', async () => {
      const dto: PagingTopicDto = {
        like__name: 'test',
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [topic], total: 1
      });

      const result = await topicService.getTopics(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'Topic'
        , dto
        , { like__name: 'test' }
        , { createdAt: 'desc' }
      )
      expect(result.total).toEqual(1);
    });
  });

  describe('createTopic', () => {
    it('토픽을 생성합니다.', async () => {
      repository.save.mockResolvedValue(topic);

      const result = await topicService.createTopic(createDto);

      expect(result).toEqual(topic.toDto());
      expect(repository.save).toHaveBeenCalledWith(new Topic(0, createDto.name));
    });
  });

  describe('updateTopic', () => {
    it('토픽을 수정합니다.', async () => {
      const updatedTopic = topic;
      updatedTopic.name = "updated";

      repository.findById.mockResolvedValue(topic);
      repository.update.mockResolvedValue(updatedTopic);

      const result = await topicService.updateTopic(updateDto);

      expect(result).toEqual(updatedTopic.toDto());
      expect(repository.findById).toHaveBeenCalledWith(updateDto.id);
      expect(repository.update).toHaveBeenCalledWith(new Topic(updateDto.id, updateDto.name));
    });
  });

  describe('deleteTopic', () => {
    it('토픽을 삭제합니다.', async () => {
      repository.delete.mockResolvedValue();

      await topicService.deleteTopic(0);
    });
  });
});
