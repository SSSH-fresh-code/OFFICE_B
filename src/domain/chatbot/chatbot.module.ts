import { Module } from "@nestjs/common";
import { InfraModule } from "../../infrastructure/infra.module";
import { MessengerType } from "./domain/chatbot.entity";
import { TelegramExternalService } from "./application/telegram.external";
import { MessengerFactory } from "./infrastructure/messenger.factory";
import {
	CHATBOT_REPOSITORY,
	CHAT_REPOSITORY,
	MESSENGER_FACTORY,
} from "./chatbot.const";
import { PrismaChatBotRepository } from "../../infrastructure/db/repositories/prisma-chatbot.repository";
import { PrismaChatRepository } from "../../infrastructure/db/repositories/prisma-chat.repository";
import { ChatBotController } from "./presentation/chatbot.controller";
import { ChatBotService } from "./application/chatbot.service";
import { ChatService } from "./application/chat.service";
import { ChatController } from "./presentation/chat.controller";
import { DiscordExternalService } from "./application/discord.external";

@Module({
	imports: [InfraModule],
	providers: [
		ChatBotService,
		ChatService,
		{
			provide: MESSENGER_FACTORY,
			useClass: MessengerFactory,
		},
		{
			provide: MessengerType.TELEGRAM,
			useClass: TelegramExternalService,
		},
		{
			provide: MessengerType.DISCORD,
			useClass: DiscordExternalService,
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
	controllers: [ChatBotController, ChatController],
})
export class ChatBotModule {}
