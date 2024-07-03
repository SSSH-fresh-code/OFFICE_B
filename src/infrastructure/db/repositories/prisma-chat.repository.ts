import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChatBot, MessengerType } from '../../../domain/chatbot/domain/chatbot.entity';
import { IChatRepository } from '../../../domain/chatbot/infrastructure/chat.repository';
import { Chat } from '../../../domain/chatbot/domain/chat.entity';

@Injectable()
export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createChat({ chatId, name, type }: Chat): Promise<Chat> {
    const chat = await this.prisma.chat.create({
      data: {
        chatId, name, type
      }
    });

    return Chat.of(chat);
  }
  async deleteChat(id: number): Promise<void> {
    await this.prisma.chat.delete({
      where: { id }
    });
  }

  async findChatsByType(type: MessengerType): Promise<Chat[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        type
      },
      orderBy: {
        name: "asc"
      }
    });

    return chats.map(chat => Chat.of(chat));
  }

}