import { iChat } from "./chat.interface";
import { ChatBot } from "./chatbot.entity";
import { iChatBot } from "./chatbot.interface";

/**
 * Chat 엔티티 클래스
 */
export class Chat implements iChat {
  private _id: number;
  private _chatId: string;
  private _name: string;

  /**
   * 생성자
   * @param id - 채팅 ID
   * @param chatId - 채팅방 ID
   * @param name - 채팅방 이름
   */
  constructor(id: number, chatId: string, name: string, chatBot?: ChatBot) {
    this._id = id;
    this._chatId = chatId;
    this._name = name;
  }

  /**
   * 채팅 ID getter
   * @returns number 채팅 ID
   */
  get id(): number {
    return this._id;
  }


  /**
   * 채팅방 ID getter
   * @returns string 채팅방 ID
   */
  get chatId(): string {
    return this._chatId;
  }

  /**
   * 채팅방 이름 getter
   * @returns string 채팅방 이름
   */
  get name(): string {
    return this._name;
  }

  validate(bot: iChatBot): void {
    throw new Error("not implments");
  }
}