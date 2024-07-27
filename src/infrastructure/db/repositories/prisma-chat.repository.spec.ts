import {Test, TestingModule} from '@nestjs/testing';
import {PrismaService} from '../prisma.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from '../../module/logger.module';
import {Chat} from '../../../domain/chatbot/domain/chat.entity';
import {PrismaChatRepository} from './prisma-chat.repository';
import {MessengerType} from '../../../domain/chatbot/domain/chatbot.entity';
import {Prisma} from '@prisma/client';

describe('PrismaChatBotRepository', () => {
  let repository: PrismaChatRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({isGlobal: true}), LoggerModule],
      providers: [PrismaService, PrismaChatRepository, ConfigService],
    }).compile();

    repository = module.get<PrismaChatRepository>(PrismaChatRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['Chat']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createChat', () => {
    it('채팅을 생성합니다.', async () => {
      const chat = new Chat(0, 'chatId', 'name', MessengerType.DISCORD);

      const createdChat = await repository.createChat(chat);

      expect(createdChat.id).not.toEqual(chat.id);
      expect(createdChat.chatId).toEqual(chat.chatId);
      expect(createdChat.name).toEqual(chat.name);
      expect(createdChat.type).toEqual(chat.type);
    });
  });

  describe('deleteChat', () => {
    it('채팅을 삭제합니다.', async () => {
      const {id} = await prisma.chat.create({
        data: {
          chatId: 'chatId',
          name: 'name',
          type: 'DISCORD',
        },
      });

      await repository.deleteChat(id);

      await expect(async () => {
        await prisma.chat.findUniqueOrThrow({
          where: {id},
        });
      }).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('존재하지 않는 채팅 id를 삭제합니다.', async () => {
      await expect(async () => await repository.deleteChat(0)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('findByChatsByType', () => {
    it('type으로 채팅들을 조회합니다.', async () => {
      const createdChats = [1, 2, 3, 4, 5].map(async (e) => {
        await prisma.chat.create({
          data: {
            name: e.toString(),
            chatId: e.toString(),
            type: MessengerType.DISCORD,
          },
        });
      });

      await Promise.all(createdChats);

      const chats = await repository.findChatsByType(MessengerType.DISCORD);

      expect(chats.length).toBe(5);
    });
  });
});
