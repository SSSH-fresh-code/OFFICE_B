import { Inject, Injectable } from "@nestjs/common";
import { MessengerType } from "../domain/chatbot.entity";
import { TelegramExternalService } from "../application/telegram.external";
import { iMessengerExternalService } from "../application/messenger.external.interface";

@Injectable()
export class MessengerFactory {
  constructor(
    @Inject(MessengerType.TELEGRAM) private readonly telegramExternalService: iMessengerExternalService,
  ) { }

  getMessengerService(type: MessengerType) {
    switch (type) {
      case MessengerType.TELEGRAM: return this.telegramExternalService;
      default: throw new Error('아직 구현되지 않은 타입입니다.');
    }
  }
}