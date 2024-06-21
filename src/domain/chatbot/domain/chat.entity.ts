import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { iChat } from "./chat.interface";
import { MessengerType } from "./chatbot.entity";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { HttpStatus } from "@nestjs/common";

/**
 * Chat 엔티티 클래스
 */
export class Chat implements iChat {
  private _id: number;
  private _chatId: string;
  private _name: string;
  private _type: string;

  /**
   * 생성자
   * @param id - 채팅 ID
   * @param chatId - 채팅방 ID
   * @param name - 채팅방 이름
   * @param type - 채팅방 타입
   */
  constructor(id: number, chatId: string, name: string, type: MessengerType | string) {
    this._id = id;
    this._chatId = chatId;
    this._name = name;
    this._type = type;
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

  /**
   * 채팅방 타입 getter
   * @returns string 채팅방 타입
   */
  get type(): string {
    return this._type;
  }

  validate(): void {
    if (this._chatId.length < 1 || this._name.length < 1) {
      throw new SsshException(ExceptionEnum.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const keys = Object.keys(MessengerType);

      for (const key of keys)
        if (MessengerType[key] === this._type) return;
    }
  }
}