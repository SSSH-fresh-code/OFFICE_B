import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { iChat } from "./chat.interface";
import { MessengerType } from "./chatbot.entity";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { HttpStatus } from "@nestjs/common";
import { Chat as PrismaChat } from "@prisma/client";
import { ReadChatDto } from "../presentation/dto/read-chat.dto";

/**
 * Chat 엔티티 클래스
 */
export class Chat implements iChat {
  private _id: number;
  private _chatId: string;
  private _name: string;
  private _type: MessengerType;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  /**
   * 생성자
   * @param id - 채팅 ID
   * @param chatId - 채팅방 ID
   * @param name - 채팅방 이름
   * @param type - 채팅방 타입
   */
  constructor(id: number, chatId: string, name: string, type: MessengerType, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._chatId = chatId;
    this._name = name;
    this._type = type;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;

  }

  static of({ id, chatId, name, type, createdAt, updatedAt }: PrismaChat) {
    return new this(id, chatId, name, MessengerType[type], createdAt, updatedAt);
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
  get type(): MessengerType {
    return this._type;
  }

  /**
   * 채팅방 생성일자 getter
   * @returns Date 채팅방 생성일자
   */
  get createdAt(): Date {
    return this._createdAt;
  }
  /**
   * 채팅방 수정일자 getter
   * @returns Date 채팅방 수정일자
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  validate(): void {
    if (
      (this._chatId && this._chatId.length > 0)
      && (this._name && this._name.length > 0)
    ) {
      const keys = Object.keys(MessengerType);

      for (const key of keys)
        if (MessengerType[key] === this._type) return;
    } else {
      throw new SsshException(ExceptionEnum.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  toDto(): ReadChatDto {
    return {
      id: this._id,
      chatId: this._chatId,
      name: this._name,
      type: this._type,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    }
  }

}
