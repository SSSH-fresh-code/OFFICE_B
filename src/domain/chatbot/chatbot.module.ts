import { Module } from '@nestjs/common';
import { InfraModule } from '../../infrastructure/infra.module';
import { MessengerType } from './domain/chatbot.entity';
import { TelegramExternalService } from './application/telegram.external';
import { MessengerFactory } from './infrastructure/messenger.factory';
import { CHATBOT_REPOSITORY, CHAT_REPOSITORY, MESSENGER_FACTORY } from './chatbot.const';
import { PrismaChatBotRepository } from '../../infrastructure/db/repositories/prisma-chatbot.repository';
import { PrismaChatRepository } from '../../infrastructure/db/repositories/prisma-chat.repository';
import { ChatBotController } from './presentation/chatbot.controller';
import { ChatBotService } from './application/chatbot.service';

@Module({
  imports: [InfraModule],
  providers: [
    ChatBotService,
    {
      provide: MESSENGER_FACTORY,
      useClass: MessengerFactory
    },
    {
      provide: MessengerType.TELEGRAM,
      useClass: TelegramExternalService,
    },
    {
      provide: CHATBOT_REPOSITORY,
      useClass: PrismaChatBotRepository,
    },
    {
      provide: CHAT_REPOSITORY,
      useClass: PrismaChatRepository,
    },
  ],
  controllers: [ChatBotController],
})
export class ChatBotModule { }