import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "src/infrastructure/module/logger.module";
import { PrismaService } from "../prisma.service";
import { TopicRepository } from "src/domain/blog/infrastructure/topic/topic.repository";
import { PrismatopicRepository } from "./prisma-topic.repository";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";
import { equal } from "assert";

describe('PrismaTopicRepository', () => {
  let repository: TopicRepository;
  let prisma: PrismaService;

  const dummyTopic = new Topic(0, "name");

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule],
      providers: [
        PrismaService,
        PrismatopicRepository,
        ConfigService
      ],
    }).compile();

    repository = module.get<TopicRepository>(PrismatopicRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['Topic']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('findById', () => {
    it('id로 Topic을 조회합니다.', async () => {
      const t = await prisma.topic.create({ data: dummyTopic });

      const topic = await repository.findById(t.id);

      expect(t.id).toEqual(topic.id);
      expect(t.name).toEqual(topic.name);
    });
    it('존재하지 않는 Topic을 조회합니다.', async () => {

    });
  });
  describe('findByName', () => {
    it('name으로 Topic을 조회합니다.', async () => {

    });
    it('존재하지 않는 Topic을 조회합니다.', async () => {

    });

  });
  describe('save', () => {
    it('Topic을 생성합니다.', async () => {

    });
    it('이미 존재하는 이름으로 Topic을 생성합니다.', async () => {

    });
  });
  describe('update', () => {
    it('Topic을 수정합니다.', async () => {

    });
    it('이미 존재하는 이름으로 Topic을 수정합니다.', async () => {

    });
    it('존재하지 않는 Topic을 수정합니다.', async () => {

    });

  });
  describe('delete', () => {
    it('Topic을 삭제합니다.', async () => {

    });
    it('존재하지 않는 Topic을 삭제합니다.', async () => {

    });
  });
})
