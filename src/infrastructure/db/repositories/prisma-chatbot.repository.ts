import { Injectable } from '@nestjs/common';
import { IChatBotRepository } from 'src/domain/chatbot/infrastructure/chatbot.repository';
import { PrismaService } from '../prisma.service';
import { ChatBot, MessengerType } from '../../../domain/chatbot/domain/chatbot.entity';
import { Chat } from '../../../domain/chatbot/domain/chat.entity';

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
      savedBot.type as MessengerType,
    )
  }
  async updateChatBot(bot: ChatBot): Promise<ChatBot> {
    const updatedBot = await this.prisma.chatBot.update({
      where: { id: bot.id },
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
        type: bot.type,
        chats: {
          connect: bot.chats.map(c => ({ id: c.id }))
        }
      },
      include: {
        chats: true
      }
    });

    return new ChatBot(
      updatedBot.id,
      updatedBot.botId,
      updatedBot.token,
      updatedBot.name,
      updatedBot.description,
      updatedBot.permissionId,
      updatedBot.type as MessengerType,
      updatedBot.chats.map(c => new Chat(c.id, c.chatId, c.name))
    )
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