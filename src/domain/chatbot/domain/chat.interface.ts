import { AggregateRoot } from "../../aggregate-root.interface";
import { iChatBot } from "./chatbot.interface";

/**
 * Chat 인터페이스
 */
export interface iChat {
  get chatId(): string
  get name(): string;
  validate(bot: iChatBot): void;
}
