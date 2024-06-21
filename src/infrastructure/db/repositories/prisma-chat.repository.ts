import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChatBot, MessengerType } from '../../../domain/chatbot/domain/chatbot.entity';
import { IChatRepository } from '../../../domain/chatbot/infrastructure/chat.repository';
import { Chat } from '../../../domain/chatbot/domain/chat.entity';

@Injectable()
export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) { }

  createChat(chat: Chat): Promise<Chat> {
    throw new Error('Method not implemented.');
  }
  deleteChat(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findChatsByType(type: MessengerType): Promise<Chat[]> {
    throw new Error('Method not implemented.');
  }

}