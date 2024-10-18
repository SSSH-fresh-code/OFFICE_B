import { Injectable } from "@nestjs/common";
import { IChatBotRepository } from "../../../domain/chatbot/infrastructure/chatbot.repository";
import { PrismaService } from "../prisma.service";
import { ChatBot } from "../../../domain/chatbot/domain/chatbot.entity";

@Injectable()
export class PrismaChatBotRepository implements IChatBotRepository {
	constructor(private readonly prisma: PrismaService) {}
	async createChatBot(bot: ChatBot): Promise<ChatBot> {
		const savedBot = await this.prisma.chatBot.create({
			data: {
				botId: bot.botId,
				token: bot.token,
				name: bot.name,
				description: bot.description,
				type: bot.type,
			},
		});

		return ChatBot.of(savedBot);
	}

	async updateChatBot(bot: ChatBot, chatIds: number[] = []): Promise<ChatBot> {
		const updatedBot = await this.prisma.chatBot.update({
			where: { id: bot.id },
			data: {
				botId: bot.botId,
				token: bot.token,
				name: bot.name,
				description: bot.description,
				type: bot.type,
				chats: {
					set: chatIds.map((i) => ({
						id: i,
					})),
				},
			},
			include: {
				chats: true,
			},
		});

		return ChatBot.of(updatedBot);
	}

	async deleteChatBot(id: number): Promise<void> {
		await this.prisma.chatBot.delete({
			where: { id },
		});
	}

	async findChatBotById(id: number): Promise<ChatBot> {
		const bot = await this.prisma.chatBot.findUniqueOrThrow({
			where: { id },
			include: { chats: true },
		});

		return ChatBot.of(bot);
	}
}
