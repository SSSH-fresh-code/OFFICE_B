import { permission } from 'process';
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma.service";
import { PrismaChatBotRepository } from "./prisma-chatbot.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "../../../infrastructure/module/logger.module";
import { ChatBot, MessengerType } from "../../../domain/chatbot/domain/chatbot.entity";
import { Permission } from "../../../domain/permission/domain/permission.entity";
import { Prisma } from "@prisma/client";
import { Chat } from "../../../domain/chatbot/domain/chat.entity";

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

  });

  beforeEach(async () => {
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    await prisma.cleanDatabase(['Permission', 'Chat', 'ChatBot']);
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

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);

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

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);
      const bot2: ChatBot = new ChatBot(0, "id2", "token2", "name2", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);

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

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);
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

      const bot2: ChatBot = new ChatBot(0, "id", "token2", "name2", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);

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

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);

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

      const bot2: ChatBot = new ChatBot(0, "id2", "token", "name2", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);


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

      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);

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

      const bot2: ChatBot = new ChatBot(0, "id2", "token2", "name", "챗봇입니다.", permission.name, MessengerType.TELEGRAM);

      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('updateChatBot', () => {
    it('챗봇을 수정합니다.', async () => {
      const updatedId = "updatedId";
      const updatedName = "updatedName";
      const updatedToken = "updatedToken";
      const updatedDescription = "updatedDescription";
      const permissions = [];

      await (["CHAT0001", "CHAT0002"].forEach(async (str, idx) => {
        const p = await prisma.permission.create({
          data: {
            name: str,
            description: `챗봇 권한 ${idx}`
          }
        });

        permissions.push(p);
      }))

      const createdChat = await prisma.chat.create({
        data: {
          chatId: "chatId",
          name: "name",
        }
      });
      const chat = new Chat(createdChat.id, createdChat.chatId, createdChat.name);

      const createdBot = await prisma.chatBot.create({
        data: {
          botId: "id",
          token: "token",
          name: "name",
          description: "챗봇입니다.",
          permission: {
            connect: {
              name: permissions[0].name
            }
          },
          type: MessengerType.TELEGRAM,
          chats: {
            connect: {
              id: chat.id
            }
          }
        }
      });

      const updateBot = new ChatBot(createdBot.id, updatedId, updatedToken, updatedName, updatedDescription, permissions[1].name, MessengerType.TELEGRAM);
      updateBot.addChat(chat);


      const updatedBot = await repository.updateChatBot(updateBot);

      expect(updateBot).toEqual(updatedBot);
      expect(updatedBot.chats.length).toBe(1);
      expect(updatedBot.chats[0]).toEqual(chat);
    });

    it('존재하지 않는 챗봇을 수정하는 경우 에러를 반환합니다.', async () => {
      const bot: ChatBot = new ChatBot(0, "id", "token", "name", "챗봇입니다.", "", MessengerType.TELEGRAM);

      await expect(() => repository.updateChatBot(bot)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
    it('존재하지 않는 채팅방을 연결하는 경우 에러를 반환합니다.', async () => {
      const p = await prisma.permission.create({
        data: {
          name: "TEST0001",
          description: `챗봇 권한`
        }
      });

      const createdBot = await prisma.chatBot.create({
        data: {
          botId: "id",
          token: "token",
          name: "name",
          description: "챗봇입니다.",
          permission: {
            connect: {
              name: p.name
            }
          },
          type: MessengerType.TELEGRAM,
        }
      });

      const chatBot = new ChatBot(createdBot.id, createdBot.botId, createdBot.token, createdBot.name, createdBot.description, p.name, MessengerType.TELEGRAM);
      const chat = new Chat(0, "fake", "name");

      chatBot.addChat(chat);


      await expect(() => repository.updateChatBot(chatBot)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('중복되는 컬럼인 경우 에러를 반환합니다.', async () => {
      const p = await prisma.permission.create({
        data: {
          name: "TEST0001",
          description: `챗봇 권한`
        }
      });

      const createdBot = await prisma.chatBot.create({
        data: {
          botId: "id",
          token: "token",
          name: "name",
          description: "챗봇입니다.",
          permission: {
            connect: {
              name: p.name
            }
          },
          type: MessengerType.TELEGRAM,
        }
      });

      const updateBot = await prisma.chatBot.create({
        data: {
          botId: "id0",
          token: "token0",
          name: "name0",
          description: "챗봇입니다2",
          permission: {
            connect: {
              name: p.name
            }
          },
          type: MessengerType.TELEGRAM,
        }
      });

      [
        new ChatBot(updateBot.id, createdBot.botId, "token1", "name1", "챗봇입니다.", "", MessengerType.TELEGRAM),
        new ChatBot(updateBot.id, "id2", createdBot.token, "name2", "챗봇입니다.", "", MessengerType.TELEGRAM),
        new ChatBot(updateBot.id, "id3", "token3", createdBot.name, "챗봇입니다.", "", MessengerType.TELEGRAM)
      ]
        .forEach(async (e) => {
          await expect(() => repository.updateChatBot(e)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
        })
    });
  });
});