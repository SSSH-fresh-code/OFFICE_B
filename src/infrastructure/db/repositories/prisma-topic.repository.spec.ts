import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "src/infrastructure/module/logger.module";
import { PrismaService } from "../prisma.service";
import { TopicRepository } from "src/domain/blog/infrastructure/topic/topic.repository";
import { PrismaTopicRepository } from "./prisma-topic.repository";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";
import { Prisma } from "@prisma/client";

describe('PrismaTopicRepository', () => {
  let repository: TopicRepository;
  let prisma: PrismaService;

  const dummyTopic = new Topic(0, "name");

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule],
      providers: [
        PrismaService,
        PrismaTopicRepository,
        ConfigService
      ],
    }).compile();

    repository = module.get<TopicRepository>(PrismaTopicRepository);
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
      const t = await prisma.topic.create({
        data: {
          id: dummyTopic.id,
          name: dummyTopic.name
        }
      });

      const topic = await repository.findById(t.id);

      expect(t.id).toEqual(topic.id);
      expect(t.name).toEqual(topic.name);
    });

    it('존재하지 않는 Topic을 조회합니다.', async () => {
      await expect(() => repository.findById(1)).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    });
  });
  describe('findByName', () => {
    it('name으로 Topic을 조회합니다.', async () => {
      const t = await prisma.topic.create({
        data: {
          id: dummyTopic.id,
          name: dummyTopic.name
        }
      });

      const topic = await repository.findByName(t.name);

      expect(t.id).toEqual(topic.id);
      expect(t.name).toEqual(topic.name);
    });

    it('존재하지 않는 Topic을 조회합니다.', async () => {
      await expect(() => repository.findByName("Wrong")).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    });
  });
  describe('save', () => {
    it('Topic을 생성합니다.', async () => {
      const topic = await repository.save(dummyTopic);

      expect(dummyTopic.id).not.toEqual(topic.id);
      expect(dummyTopic.name).toEqual(topic.name);
    });

    it('이미 존재하는 이름으로 Topic을 생성합니다.', async () => {
      await prisma.topic.create({
        data: {
          id: dummyTopic.id,
          name: dummyTopic.name
        }
      });

      await expect(() => repository.save(dummyTopic)).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    });
  });
  describe('update', () => {
    it('Topic을 수정합니다.', async () => {
      const updateName = dummyTopic.name + "2";
      const { id } = await prisma.topic.create({
        data: {
          id: dummyTopic.id,
          name: dummyTopic.name
        }
      });

      const t = new Topic(id, updateName);

      const topic = await repository.update(t);

      expect(id).toEqual(topic.id);
      expect(dummyTopic.name).not.toEqual(topic.name);
      expect(updateName).toEqual(topic.name);
    });

    it('이미 존재하는 이름으로 Topic을 수정합니다.', async () => {
      await prisma.topic.create({
        data: {
          id: dummyTopic.id,
          name: dummyTopic.name
        }
      });

      const { id } = await prisma.topic.create({
        data: {
          name: dummyTopic.name + "2"
        }
      });

      const t = new Topic(id, dummyTopic.name);

      await expect(() => repository.update(t)).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    });

    it('존재하지 않는 Topic을 수정합니다.', async () => {
      await expect(() => repository.update(dummyTopic)).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    });
  });

  describe('delete', () => {
    it('Topic을 삭제합니다.', async () => {
      const { id } = await prisma.topic.create({
        data: {
          name: dummyTopic.name
        }
      });

      expect(() => repository.delete(id)).resolves;
    });

    it('존재하지 않는 Topic을 삭제합니다.', async () => {
      await expect(() => repository.delete(dummyTopic.id)).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    });
  });
})
