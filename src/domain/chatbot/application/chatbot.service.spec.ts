import { Test, TestingModule } from "@nestjs/testing";
import { ChatBotService } from "./chatbot.service";
import { PagingService } from "../../../infrastructure/common/services/paging.service";
import { CHATBOT_REPOSITORY, MESSENGER_FACTORY } from "../chatbot.const";
import { PrismaChatBotRepository } from "../../../infrastructure/db/repositories/prisma-chatbot.repository";
import { ChatBot, MessengerType } from "../domain/chatbot.entity";
import { CreateChatBotDto } from '../presentation/dto/create-chatbot.dto';
import { MessengerFactory } from '../infrastructure/messenger.factory';
import { UpdateChatBotDto } from '../presentation/dto/update-chatbot.dto';
import { ChatBotPagingDto } from "../presentation/dto/chatbot-paging.dto";

/**
 * Mock User Repository
 * 유저 저장소의 Mock 함수들을 정의합니다.
 */
const mockChatBotRepository = () => ({
  createChatBot: jest.fn(),
  updateChatBot: jest.fn(),
  deleteChatBot: jest.fn(),
  findChatBotById: jest.fn(),
});

const mockMessengerFactory = () => ({
  getMessengerService: jest.fn()
});
/**
 * Mock Paging Service
 * 페이징 서비스의 Mock 함수들을 정의합니다.
 */
const mockPagingService = () => ({
  getPagedResults: jest.fn(),
});

describe('ChatBotService', () => {
  let chatBotService: ChatBotService;
  let chatBotRepository;
  let pagingService;
  let messengerFactory;

  const botId = "7370566619";
  const token = "7345685563:AAFvwnUGTM2OKm4n-qpVk7uSfQq6NZJiTB4";
  const name = "chatbot";
  const description = "챗봇";
  const type = MessengerType.DISCORD;
  const permission = "TEST0001";

  let bot: ChatBot;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MESSENGER_FACTORY,
          useFactory: mockMessengerFactory,
        },
        { provide: CHATBOT_REPOSITORY, useFactory: mockChatBotRepository },
        { provide: PagingService, useFactory: mockPagingService },
        ChatBotService,
      ],
    }).compile();

    chatBotService = module.get<ChatBotService>(ChatBotService);
    chatBotRepository = module.get<PrismaChatBotRepository>(CHATBOT_REPOSITORY);
    pagingService = module.get<PagingService<ChatBot>>(PagingService);
    messengerFactory = module.get<MessengerFactory>(MESSENGER_FACTORY);
  });

  beforeEach(() => {
    bot = new ChatBot(0, botId, token, name, description, type, []);
  })

  describe('createChatBot', () => {
    it('챗봇을 정상적으로 생성합니다.', async () => {
      const dto: CreateChatBotDto = {
        botId, token, name, description, type
      };

      chatBotRepository.createChatBot.mockResolvedValue(bot);

      const createdBot = await chatBotService.createChatBot(dto);

      expect(createdBot).toEqual(bot.toDto());
      expect(chatBotRepository.createChatBot).toHaveBeenCalledWith(
        new ChatBot(0, botId, token, name, description, MessengerType[type])
      );
    });
  });

  describe('updateChatBot', () => {
    it('챗봇의 정보를 수정합니다.', async () => {
      const dto: UpdateChatBotDto = {
        id: 1, botId, token, name, description, type
      };

      const bot = new ChatBot(dto.id, dto.botId, dto.token, dto.name, dto.description, MessengerType[dto.type]);

      chatBotRepository.updateChatBot.mockResolvedValue(bot);

      const updatedBot = await chatBotService.updateChatBot(dto);

      expect(updatedBot).toEqual(bot.toDto());
      expect(chatBotRepository.updateChatBot).toHaveBeenCalledWith(bot, undefined);
    });

    it('챗봇의 정보(+채팅)를 수정합니다.', async () => {
      const chatIds: number[] = [1];
      const dto: UpdateChatBotDto = {
        id: 1, botId, token, name, description, type, chatIds
      };

      const bot = new ChatBot(dto.id, dto.botId, dto.token, dto.name, dto.description, MessengerType[dto.type]);

      chatBotRepository.updateChatBot.mockResolvedValue(bot, chatIds);

      const updatedBot = await chatBotService.updateChatBot(dto);

      expect(updatedBot).toEqual(bot.toDto());
      expect(chatBotRepository.updateChatBot).toHaveBeenCalledWith(bot, chatIds);
    });
  });

  describe('deleteChatBot', () => {
    it('챗봇을 삭제합니다.', async () => {
      chatBotRepository.deleteChatBot.mockResolvedValue();

      await chatBotService.deleteChatBot(1);

      expect(chatBotRepository.deleteChatBot).toHaveBeenCalledWith(1);
    });
  });

  describe('getChatBotById', () => {
    it('id로 챗봇을 조회합니다.', async () => {
      bot = new ChatBot(1, botId, token, name, description, type, []);

      chatBotRepository.findChatBotById.mockResolvedValue(bot);

      const selectedChatBot = await chatBotService.getChatBotById(1);

      expect(selectedChatBot.id).toEqual(bot.id);
      expect(chatBotRepository.findChatBotById).toHaveBeenCalledWith(1);
    });
  });
  describe('getChatBots', () => {
    it('페이징 객체로 챗봇들을 조회합니다.', async () => {
      const pagingDto: ChatBotPagingDto = {
        where__type: MessengerType.DISCORD,
        page: 1,
        take: 10,
        orderby: 'createdAt',
        direction: 'desc'
      }

      pagingService.getPagedResults.mockResolvedValue({
        data: [bot], total: 1
      });

      const chatbots = await chatBotService.getChatBots(pagingDto);

      expect(pagingService.getPagedResults).toHaveBeenCalledWith(
        'ChatBot'
        , pagingDto
        , { type: MessengerType.DISCORD }
        , { createdAt: 'desc' }
      );
      expect(chatbots.total).toEqual(1);
    });
  });

});
