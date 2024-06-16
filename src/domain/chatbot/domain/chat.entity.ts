import { AggregateRoot } from "src/domain/aggregate-root.interface";
import { ChatBot } from "./chatbot.entity";

/**
 * Chat 엔티티 클래스
 */
export class Chat {
  private _id: number;
  private _chatBot?: ChatBot;
  private _chatId: string;
  private _chatName: string;

  /**
   * 생성자
   * @param id - 채팅 ID
   * @param chatBot - 연결된 챗봇 엔티티
   * @param chatId - 채팅방 ID
   */
  constructor(id: number, chatId: string, chatName: string, chatBot?: ChatBot) {
    this._id = id;
    this._chatId = chatId;
    this._chatName = chatName;
    this._chatBot = chatBot;
  }

  /**
   * 채팅 ID getter
   * @returns number 채팅 ID
   */
  get id(): number {
    return this._id;
  }

  /**
   * 연결된 챗봇 엔티티 getter
   * @returns ChatBot 챗봇 엔티티
   */
  get chatBot(): ChatBot {
    return this._chatBot;
  }

  /**
   * 채팅방 ID getter
   * @returns string 채팅방 ID
   */
  get chatId(): string {
    return this._chatId;
  }
}