import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma.service";
import { PrismaChatBotRepository } from "./prisma-chatbot.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "../../../infrastructure/module/logger.module";
import { ChatBot, ChatBotType } from "../../../domain/chatbot/domain/chatbot.entity";
import { Permission } from "../../../domain/permission/domain/permission.entity";
import { Prisma } from "@prisma/client";

describe('PrismaChatBotRepository', () => {
  let repository: PrismaChatBotRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule],
      providers: [
        PrismaService,
        PrismaChatBotRepository,
        ConfigService,
      ],
    }).compile();

    repository = module.get<PrismaChatBotRepository>(PrismaChatBotRepository);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['Permission', 'ChatBot']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("createChatBot", () => {
    it("챗봇을 생성합니다.", async () => {
      const permission: Permission = new Permission("CHAT0001", "챗봇1의 권한");
      await prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description
        }
      });

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);

      const savedBot = await repository.createChatBot(bot);

      expect(savedBot).toBeDefined();
      expect(await prisma.chatBot.count()).toBe(1);
      expect(savedBot.id).not.toEqual(bot.id);
      expect(savedBot.botId).toBe(bot.botId)
    });

    it("챗봇 설명은 중복을 허용합니다.", async () => {
      const permission: Permission = new Permission("CHAT0001", "챗봇1의 권한");
      await prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description
        }
      });

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);
      const bot2: ChatBot = new ChatBot(0, "id2", "token2", "name2", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);

      const savedBot = await repository.createChatBot(bot);
      const savedBot2 = await repository.createChatBot(bot2);

      expect(savedBot).not.toEqual(savedBot2);
      expect(await prisma.chatBot.count()).toBe(2);
    });

    it("중복된 챗봇Id가 있는 경우 에러를 반환합니다.", async () => {
      const permission: Permission = new Permission("CHAT0001", "챗봇1의 권한");
      await prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description
        }
      });

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);
      await prisma.chatBot.create({
        data: {
          botId: bot.botId,
          token: bot.token,
          name: bot.name,
          description: bot.description,
          permission: {
            connect: {
              name: permission.name
            }
          },
          type: bot.type
        }
      });

      const bot2: ChatBot = new ChatBot(0, "id", "token2", "name2", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);

      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it("중복된 챗봇 토큰이 있는 경우 에러를 반환합니다.", async () => {
      const permission: Permission = new Permission("CHAT0001", "챗봇1의 권한");
      await prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description
        }
      });

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);

      await prisma.chatBot.create({
        data: {
          botId: bot.botId,
          token: bot.token,
          name: bot.name,
          description: bot.description,
          permission: {
            connect: {
              name: bot.permission
            }
          },
          type: bot.type
        }
      });

      const bot2: ChatBot = new ChatBot(0, "id2", "token", "name2", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);


      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it("중복된 챗봇 이름이 있는 경우 에러를 반환합니다.", async () => {
      const permission: Permission = new Permission("CHAT0001", "챗봇1의 권한");
      await prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description
        }
      });

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);

      await prisma.chatBot.create({
        data: {
          botId: bot.botId,
          token: bot.token,
          name: bot.name,
          description: bot.description,
          permission: {
            connect: {
              name: bot.permission
            }
          },
          type: bot.type
        }
      });

      const bot2: ChatBot = new ChatBot(0, "id2", "token2", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);

      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('updateChatBot', () => {

    it('botid를 수정합니다.', async () => {
      const newId = "newId";

      const permission: Permission = new Permission("CHAT0001", "챗봇1의 권한");
      await prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description
        }
      });

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, ChatBotType.TELEGRAM);
      const savedBot = await repository.createChatBot(bot);





    });
  });

});