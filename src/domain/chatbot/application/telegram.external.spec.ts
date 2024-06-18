import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../../../infrastructure/module/logger.module';
import { iMessengerExternalService } from './messenger.external.interface';
import { TelegramExternalService } from './telegram.external';
import { ChatBot, MessengerType } from '../domain/chatbot.entity';
import { Chat } from '../domain/chat.entity';

/**
 * Mock User Service
 * 유저 서비스의 Mock 함수들을 정의합니다.
 */

global.fetch = jest.fn();

describe('TelegramExternalService', () => {
  let service: iMessengerExternalService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        TelegramExternalService
      ],
    }).compile();

    service = module.get<iMessengerExternalService>(TelegramExternalService);
  });

  describe('chat', () => {
    it('메세지를 정상적으로 전송해야합니다.', async () => {
      const chatbot = new ChatBot(
        0,
        "botid",
        "token",
        "name",
        "description",
        "TEST0001",
        MessengerType.TELEGRAM
      );

      const chat = new Chat(0, "chatId", "testChat");

      (fetch as jest.Mock).mockResolvedValue({
        ok: true
      });

      const result = await service.chat(chatbot, chat, "테스트 메세지");
    });
  });
});