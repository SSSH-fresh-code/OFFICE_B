import { PagingService } from "src/infrastructure/common/services/paging.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Topic } from "../../domain/topic/topic.entity";
import { iSeriesService } from "./series.service.interface";
import { SeriesRepository } from "../../infrastructure/series/series.repository";
import { iPagingService } from "src/infrastructure/common/services/paging.interface";
import { SERIES_REPOSITORY, TOPIC_REPOSITORY } from "../../blog.const";
import { Series } from "../../domain/series/series.entity";
import { SeriesService } from "./series.service";
import { TopicRepository } from "../../infrastructure/topic/topic.repository";
import { PagingSeriesDto } from "../../presentation/series/dto/paging-series.dto";
import { CreateSeriesDto } from "../../presentation/series/dto/create-series.dto";
import { UpdateSeriesDto } from "../../presentation/series/dto/update-series.dto";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";

const mockSeriesRepository = (): SeriesRepository => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const mockTopicRepository = (): TopicRepository => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const mockPagingService = (): iPagingService => ({
  getPagedResults: jest.fn()
});

describe('SeriesService', () => {
  let seriesService: iSeriesService;
  let repository: jest.Mocked<SeriesRepository>;
  let topicRepository: jest.Mocked<TopicRepository>;
  let pagingService: jest.Mocked<iPagingService>;

  let topic: Topic;
  let series: Series;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        { provide: SERIES_REPOSITORY, useFactory: mockSeriesRepository },
        { provide: TOPIC_REPOSITORY, useFactory: mockTopicRepository },
        { provide: PagingService, useFactory: mockPagingService }
      ]
    }).compile();

    seriesService = module.get<SeriesService>(SeriesService);
    repository = module.get<jest.Mocked<SeriesRepository>>(SERIES_REPOSITORY);
    topicRepository = module.get<jest.Mocked<TopicRepository>>(TOPIC_REPOSITORY);
    pagingService = module.get<jest.Mocked<iPagingService>>(PagingService);
  });

  beforeEach(() => {
    topic = new Topic(1, "topic");
    series = new Series(1, "series", topic);
  })

  describe('getSeriesByName', () => {
    it('정상적으로 name으로 주제를 조회합니다.', async () => {
      repository.findByName.mockResolvedValue(series);

      const name = series.name;

      const result = await seriesService.getSeriesByName(name);

      expect(result).toEqual(series.toDto());
      expect(repository.findByName).toHaveBeenCalledWith(name);
    });
  });

  describe('getSeries', () => {
    it('series list를 조회합니다.', async () => {
      const dto: PagingSeriesDto = {
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [series], total: 1
      });

      const result = await seriesService.getSeries(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'Series'
        , dto
        , {}
      )
      expect(result.total).toEqual(1);
      expect(result.data).toEqual([series.toDto()]);
    });

    it('name을 like로 검색하여 조회합니다.', async () => {
      const dto: PagingSeriesDto = {
        like__name: 'test',
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [series], total: 1
      });

      const result = await seriesService.getSeries(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'Series'
        , dto
        , { like__name: 'test' }
      )
      expect(result.total).toEqual(1);
      expect(result.data).toEqual([series.toDto()]);
    });

    it('topic을 기준으로 검색하여 조회합니다.', async () => {
      const dto: PagingSeriesDto = {
        where__topicId: 1,
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [series], total: 1
      });

      const result = await seriesService.getSeries(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'Series'
        , dto
        , { where__topicId: 1 }
      )
      expect(result.total).toEqual(1);
      expect(result.data).toEqual([series.toDto()]);
    });

    it('name과 topic을 기준으로 검색하여 조회합니다.', async () => {
      const dto: PagingSeriesDto = {
        where__topicId: 1,
        like__name: 'hello',
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [series], total: 1
      });

      const result = await seriesService.getSeries(dto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'Series'
        , dto
        , { where__topicId: dto.where__topicId, like__name: dto.like__name }
      )
      expect(result.total).toEqual(1);
      expect(result.data).toEqual([series.toDto()]);
    });
  });

  describe('createSeries', () => {
    it('시리즈를 생성합니다.', async () => {
      const dto: CreateSeriesDto = {
        name: series.name, topicId: topic.id
      }

      topicRepository.findById.mockResolvedValue(topic);
      repository.save.mockResolvedValue(series);

      const result = await seriesService.createSeries(dto);

      expect(result).toEqual(series.toDto());
      expect(repository.save).toHaveBeenCalledWith(new Series(0, dto.name, topic));
      expect(topicRepository.findById).toHaveBeenCalledWith(dto.topicId);
    });
  });

  describe('updateSeries', () => {
    it('시리즈의 이름, 상위 주제를 수정합니다.', async () => {
      const updateTopic = new Topic(2, "topic2")
      const dto: UpdateSeriesDto = {
        id: series.id,
        name: "updatedName",
        topicId: updateTopic.id
      }
      const updatedSeries = new Series(dto.id, dto.name, updateTopic);

      topicRepository.findById.mockResolvedValue(updateTopic);
      repository.findById.mockResolvedValue(series);
      repository.update.mockResolvedValue(updatedSeries);

      const result = await seriesService.updateSeries(dto);

      expect(result).toEqual(updatedSeries.toDto());
      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedSeries);
      expect(topicRepository.findById).toHaveBeenCalledWith(dto.topicId);
    });

    it('시리즈의 이름만 수정합니다.', async () => {
      const dto: UpdateSeriesDto = {
        id: series.id,
        name: "updatedName",
      }
      const updatedSeries = new Series(dto.id, dto.name, topic);

      repository.findById.mockResolvedValue(series);
      repository.update.mockResolvedValue(updatedSeries);

      const result = await seriesService.updateSeries(dto);

      expect(result).toEqual(updatedSeries.toDto());
      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedSeries);
    });

    it('시리즈의 상위 주제를 수정합니다.', async () => {
      const updateTopic = new Topic(2, "topic2")
      const dto: UpdateSeriesDto = {
        id: series.id,
        topicId: updateTopic.id
      }

      const updatedSeries = new Series(dto.id, series.name, updateTopic);

      topicRepository.findById.mockResolvedValue(updateTopic);
      repository.findById.mockResolvedValue(series);
      repository.update.mockResolvedValue(updatedSeries);

      const result = await seriesService.updateSeries(dto);

      expect(result).toEqual(updatedSeries.toDto());
      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      expect(repository.update).toHaveBeenCalledWith(updatedSeries);
      expect(topicRepository.findById).toHaveBeenCalledWith(dto.topicId);
    });

    it('변경 없이 update를 시도합니다.', async () => {
      const dto: UpdateSeriesDto = {
        id: series.id,
      }

      repository.findById.mockResolvedValue(series);

      expect(repository.findById).toHaveBeenCalledWith(dto.id);
      await expect(() => seriesService.updateSeries(dto)).rejects.toThrow(ExceptionEnum.NOT_MODIFIED);
    });
  });

  describe('deleteSeries', () => {
    it('시리즈를 삭제합니다.', async () => {
      repository.delete.mockResolvedValue();

      await seriesService.deleteSeries(0);
    });
  });
});
