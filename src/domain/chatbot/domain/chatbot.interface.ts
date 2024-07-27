import {AggregateRoot} from '../../../domain/aggregate-root.interface';
import {ReadChatBotDto} from '../presentation/dto/read-chatbot.dto';
import {Chat} from './chat.entity';

/**
 * ChatBot 인터페이스
 */
export interface iChatBot extends AggregateRoot {
  get id(): number;
  get botId(): string;
  get token(): string;
  get name(): string;
  get description(): string;
  get type(): string;
  get chats(): Chat[];

  /**
   * 채팅 추가 메서드
   * @param chat 추가할 채팅
   */
  addChat(chat: Chat): void;

  /**
   * 채팅 삭제 메서드
   * @param chatId 삭제할 채팅의 ID
   */
  removeChat(chatId: string): void;

  clearChat(): void;

  toDto(): ReadChatBotDto;
}
