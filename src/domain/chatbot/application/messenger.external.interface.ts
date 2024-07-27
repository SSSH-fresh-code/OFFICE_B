import {iChat} from '../domain/chat.interface';
import {iChatBot} from '../domain/chatbot.interface';

export interface iMessengerExternalService {
  readonly API_URL: string;
  readonly instanceId: number;
  chat(bot: iChatBot, chat: iChat, msg: string): Promise<boolean>;
}
