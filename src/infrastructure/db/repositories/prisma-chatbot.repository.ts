import { Injectable } from '@nestjs/common';
import { IChatBotRepository } from 'src/domain/chatbot/infrastructure/chatbot.repository';
import { PrismaService } from '../prisma.service';
import { ChatBot, ChatBotType } from '../../../domain/chatbot/domain/chatbot.entity';

@Injectable()
export class PrismaChatBotRepository implements IChatBotRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createChatBot(bot: ChatBot): Promise<ChatBot> {
    const savedBot = await this.prisma.chatBot.create({
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

    return new ChatBot(
      savedBot.id,
      savedBot.botId,
      savedBot.token,
      savedBot.name,
      savedBot.description,
      savedBot.permissionId,
      savedBot.type as ChatBotType,
    )
  }
  updateChatBot(chatBot: ChatBot): Promise<ChatBot> {
    throw new Error('Method not implemented.');
  }
  deleteChatBot(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findChatBotById(id: string): Promise<ChatBot> {
    throw new Error('Method not implemented.');
  }
  findAllChatBots(): Promise<ChatBot[]> {
    throw new Error('Method not implemented.');
  }
}