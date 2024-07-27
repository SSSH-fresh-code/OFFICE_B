import {Test, TestingModule} from '@nestjs/testing';
import {PrismaService} from '../prisma.service';
import {PrismaChatBotRepository} from './prisma-chatbot.repository';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from '../../../infrastructure/module/logger.module';
import {
  ChatBot,
  MessengerType,
} from '../../../domain/chatbot/domain/chatbot.entity';
import {Prisma} from '@prisma/client';
import {Chat} from '../../../domain/chatbot/domain/chat.entity';

describe('PrismaChatBotRepository', () => {
  let repository: PrismaChatBotRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({isGlobal: true}), LoggerModule],
      providers: [PrismaService, PrismaChatBotRepository, ConfigService],
    }).compile();

    repository = module.get<PrismaChatBotRepository>(PrismaChatBotRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['ChatBot', 'Chat']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createChatBot', () => {
    it('챗봇을 생성합니다.', async () => {
      const bot: ChatBot = new ChatBot(
        0,
        'id',
        'token',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      const savedBot = await repository.createChatBot(bot);

      expect(savedBot).toBeDefined();
      expect(await prisma.chatBot.count()).toBe(1);
      expect(savedBot.id).not.toEqual(bot.id);
      expect(savedBot.botId).toBe(bot.botId);
    });

    it('챗봇 설명은 중복을 허용합니다.', async () => {
      const bot: ChatBot = new ChatBot(
        0,
        'id',
        'token',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );
      const bot2: ChatBot = new ChatBot(
        0,
        'id2',
        'token2',
        'name2',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      const savedBot = await repository.createChatBot(bot);
      const savedBot2 = await repository.createChatBot(bot2);

      expect(savedBot).not.toEqual(savedBot2);
      expect(await prisma.chatBot.count()).toBe(2);
    });

    it('중복된 챗봇Id가 있는 경우 에러를 반환합니다.', async () => {
      const bot: ChatBot = new ChatBot(
        0,
        'id',
        'token',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );
      await prisma.chatBot.create({
        data: {
          botId: bot.botId,
          token: bot.token,
          name: bot.name,
          description: bot.description,
          type: bot.type,
        },
      });

      const bot2: ChatBot = new ChatBot(
        0,
        'id',
        'token2',
        'name2',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });

    it('중복된 챗봇 토큰이 있는 경우 에러를 반환합니다.', async () => {
      const bot: ChatBot = new ChatBot(
        0,
        'id',
        'token',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      await prisma.chatBot.create({
        data: {
          botId: bot.botId,
          token: bot.token,
          name: bot.name,
          description: bot.description,
          type: bot.type,
        },
      });

      const bot2: ChatBot = new ChatBot(
        0,
        'id2',
        'token',
        'name2',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });

    it('중복된 챗봇 이름이 있는 경우 에러를 반환합니다.', async () => {
      const bot: ChatBot = new ChatBot(
        0,
        'id',
        'token',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      await prisma.chatBot.create({
        data: {
          botId: bot.botId,
          token: bot.token,
          name: bot.name,
          description: bot.description,
          type: bot.type,
        },
      });

      const bot2: ChatBot = new ChatBot(
        0,
        'id2',
        'token2',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      await expect(() => repository.createChatBot(bot2)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('updateChatBot', () => {
    it('챗봇을 수정합니다.', async () => {
      const updatedId = 'updatedId';
      const updatedName = 'updatedName';
      const updatedToken = 'updatedToken';
      const updatedDescription = 'updatedDescription';

      const createdChat = await prisma.chat.create({
        data: {
          chatId: 'chatId',
          name: 'name',
          type: MessengerType.DISCORD,
        },
      });
      const chat = new Chat(
        createdChat.id,
        createdChat.chatId,
        createdChat.name,
        MessengerType.DISCORD,
      );

      const createdBot = await prisma.chatBot.create({
        data: {
          botId: 'id',
          token: 'token',
          name: 'name',
          description: '챗봇입니다.',
          type: MessengerType.TELEGRAM,
          chats: {
            connect: {
              id: chat.id,
            },
          },
        },
      });

      const updateBot = new ChatBot(
        createdBot.id,
        updatedId,
        updatedToken,
        updatedName,
        updatedDescription,
        MessengerType.TELEGRAM,
        [chat],
      );

      const updatedBot = await repository.updateChatBot(updateBot, [chat.id]);

      expect(updateBot.id).toEqual(updatedBot.id);
      expect(updateBot.botId).toEqual(updatedBot.botId);
      expect(updateBot.token).toEqual(updatedBot.token);
      expect(updateBot.name).toEqual(updatedBot.name);
      expect(updateBot.description).toEqual(updatedBot.description);
      expect(updateBot.type).toEqual(updatedBot.type);
      expect(updatedBot.chats.length).toBe(1);
      expect(updatedBot.chats[0]).toEqual(chat);
    });

    it('존재하지 않는 챗봇을 수정하는 경우 에러를 반환합니다.', async () => {
      const bot: ChatBot = new ChatBot(
        0,
        'id',
        'token',
        'name',
        '챗봇입니다.',
        MessengerType.TELEGRAM,
      );

      await expect(() => repository.updateChatBot(bot)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
    it('존재하지 않는 채팅방을 연결하는 경우 에러를 반환합니다.', async () => {
      const createdBot = await prisma.chatBot.create({
        data: {
          botId: 'id',
          token: 'token',
          name: 'name',
          description: '챗봇입니다.',
          type: MessengerType.TELEGRAM,
        },
      });

      const chatBot = new ChatBot(
        createdBot.id,
        createdBot.botId,
        createdBot.token,
        createdBot.name,
        createdBot.description,
        MessengerType.TELEGRAM,
      );
      const chat = new Chat(0, 'fake', 'name', MessengerType.DISCORD);

      await expect(() =>
        repository.updateChatBot(chatBot, [chat.id]),
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('중복되는 컬럼인 경우 에러를 반환합니다.', async () => {
      const createdBot = await prisma.chatBot.create({
        data: {
          botId: 'id',
          token: 'token',
          name: 'name',
          description: '챗봇입니다.',
          type: MessengerType.TELEGRAM,
        },
      });

      const updateBot = await prisma.chatBot.create({
        data: {
          botId: 'id0',
          token: 'token0',
          name: 'name0',
          description: '챗봇입니다2',
          type: MessengerType.TELEGRAM,
        },
      });

      [
        new ChatBot(
          updateBot.id,
          createdBot.botId,
          'token1',
          'name1',
          '챗봇입니다.',
          MessengerType.TELEGRAM,
        ),
        new ChatBot(
          updateBot.id,
          'id2',
          createdBot.token,
          'name2',
          '챗봇입니다.',
          MessengerType.TELEGRAM,
        ),
        new ChatBot(
          updateBot.id,
          'id3',
          'token3',
          createdBot.name,
          '챗봇입니다.',
          MessengerType.TELEGRAM,
        ),
      ].forEach(async (e) => {
        await expect(() => repository.updateChatBot(e)).rejects.toThrow(
          Prisma.PrismaClientKnownRequestError,
        );
      });
    });
  });

  describe('deleteChatBot', () => {
    it('채팅이 존재하지 않는 챗봇을 삭제합니다.', async () => {
      const createdBot = await prisma.chatBot.create({
        data: {
          botId: 'id',
          token: 'token',
          name: 'name',
          description: '챗봇입니다.',
          type: MessengerType.TELEGRAM,
        },
      });

      await repository.deleteChatBot(createdBot.id);
    });

    it('채팅이 존재하는 챗봇을 삭제합니다.', async () => {
      const createdChat = await prisma.chat.create({
        data: {
          chatId: 'chatId',
          name: 'name',
          type: MessengerType.DISCORD,
        },
      });
      const chat = new Chat(
        createdChat.id,
        createdChat.chatId,
        createdChat.name,
        MessengerType.DISCORD,
      );

      const createdBot = await prisma.chatBot.create({
        data: {
          botId: 'id',
          token: 'token',
          name: 'name',
          description: '챗봇입니다.',
          type: MessengerType.TELEGRAM,
          chats: {
            connect: {
              id: chat.id,
            },
          },
        },
      });
      await repository.deleteChatBot(createdBot.id);
    });

    it('존재하지 않는 챗봇을 삭제하면 에러를 반환합니다.', async () => {
      expect(async () => await repository.deleteChatBot(0)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('findChatBotById', () => {
    it('id로 ChatBot을 조회합니다.', async () => {
      const createdChat = await prisma.chat.create({
        data: {
          chatId: 'chatId',
          name: 'name',
          type: MessengerType.DISCORD,
        },
      });
      const chat = new Chat(
        createdChat.id,
        createdChat.chatId,
        createdChat.name,
        MessengerType.DISCORD,
      );

      const bot = await prisma.chatBot.create({
        data: {
          botId: 'id',
          token: 'token',
          name: 'name',
          description: '챗봇입니다.',
          type: MessengerType.TELEGRAM,
          chats: {
            connect: {
              id: chat.id,
            },
          },
        },
        include: {chats: true},
      });

      const result = await repository.findChatBotById(bot.id);

      expect(result).toBeInstanceOf(ChatBot);
      expect(ChatBot.of(bot)).toEqual(result);
    });

    it('존재하지 않는 id를 조회하는 경우 에러를 반환합니다.', async () => {
      expect(async () => await repository.findChatBotById(0)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });
});
