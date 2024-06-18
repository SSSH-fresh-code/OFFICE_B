import { Module } from '@nestjs/common';
import { InfraModule } from '../../infrastructure/infra.module';
import { MessengerType } from './domain/chatbot.entity';
import { TelegramExternalService } from './application/telegram.external';
import { ChatService } from './application/chat.service';
import { MessengerFactory } from './infrastructure/messenger.factory';
import { ChatController } from './presentation/chatbot.controller';

@Module({
  imports: [InfraModule],
  providers: [
    ChatService,
    {
      provide: "factory",
      useClass: MessengerFactory,
    },
    {
      provide: MessengerType.TELEGRAM,
      useClass: TelegramExternalService,
    },
  ],
  controllers: [ChatController],
})
export class ChatBotModule { }