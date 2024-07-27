import {AggregateRoot} from '../../aggregate-root.interface';
import {MessengerType} from './chatbot.entity';
import {iChatBot} from './chatbot.interface';

/**
 * Chat 인터페이스
 */
export interface iChat {
  get id(): number;
  get chatId(): string;
  get name(): string;
  get type(): MessengerType;
  validate(): void;
}
