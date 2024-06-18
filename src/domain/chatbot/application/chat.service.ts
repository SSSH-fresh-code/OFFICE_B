import { Inject, Injectable } from '@nestjs/common';
import { MessengerFactory } from './../infrastructure/messenger.factory';
import { ChatBot, MessengerType } from '../domain/chatbot.entity';
import { ChatDto } from '../presentation/dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(@Inject("factory") private readonly messengerFactory: MessengerFactory) { }

  async chat(dto: ChatDto) {
    throw new Error("not implements");
  }
}