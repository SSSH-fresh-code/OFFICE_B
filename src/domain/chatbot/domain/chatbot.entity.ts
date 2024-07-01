import { SsshException } from '../../../infrastructure/filter/exception/sssh.exception';
import { Chat } from './chat.entity';
import { iChatBot } from './chatbot.interface';
import { Chat as PrismaChat, ChatBot as PrismaChatBot } from "@prisma/client";
import { ExceptionEnum } from '../../../infrastructure/filter/exception/exception.enum';
import { HttpStatus, Logger } from '@nestjs/common';
import { ReadChatBotDto } from '../presentation/dto/read-chatbot.dto';

/**
 * ChatBot 엔티티 클래스
 */
export class ChatBot implements iChatBot {
  private readonly logger = new Logger(ChatBot.name);
  private _chats: Chat[];

  constructor(
    private _id: number,
    private _botId: string,
    private _token: string,
    private _name: string,
    private _description: string,
    private _type: MessengerType,
    chats: Chat[] = [],
    private _createdAt?: Date,
    private _updatedAt?: Date,
  ) {
    this._chats = chats;
  }

  static of({
    id, botId, token, name, description, type, chats, createdAt, updatedAt
  }: PrismaChatBot & { chats?: PrismaChat[] }) {
    let messengerType = MessengerType.TELEGRAM;

    switch (type) {
      case MessengerType.SLACK:
        messengerType = MessengerType.SLACK;
        break;
      case MessengerType.DISCORD:
        messengerType = MessengerType.DISCORD;
        break;
    }

    return new ChatBot(
      id,
      botId,
      token,
      name,
      description,
      messengerType,
      chats ? chats.map(c => new Chat(c.id, c.chatId, c.name, MessengerType[c.type])) : [],
      createdAt,
      updatedAt
    );
  }



  /**
   * ID getter
   * @returns number 봇 ID
   */
  get id(): number {
    return this._id;
  }

  /**
   * 봇 ID getter
   * @returns string 봇 ID
   */
  get botId(): string {
    return this._botId;
  }

  set botId(botId: string) {
    this._botId = botId;
  }

  /**
   * 토큰 getter
   * @returns string 토큰
   */
  get token(): string {
    return this._token;
  }


  public set token(token: string) {
    this._token = token;
  }


  /**
   * 이름 getter
   * @returns string 봇 이름
   */
  get name(): string {
    return this._name;
  }


  public set name(name: string) {
    this._name = name;
  }


  /**
   * 설명 getter
   * @returns string 봇 설명
   */
  get description(): string {
    return this._description;
  }

  public set description(description: string) {
    this._description = description;
  }

  /**
   * 타입 getter
   * @returns ChatBotType 봇 타입
   */
  get type(): MessengerType {
    return this._type;
  }

  /**
   * 채팅 배열 getter
   * @returns Chat[] 채팅 배열
   */
  get chats(): Chat[] {
    return this._chats;
  }

  /**
   * 채팅 추가 메서드
   * @param chat 추가할 채팅
   */
  addChat(chat: Chat): void {
    this._chats.push(chat);
  }

  /**
   * 채팅 삭제 메서드
   * @param chatId 삭제할 채팅의 ID
   */
  removeChat(chatId: string): void {
    this._chats = this._chats.filter(chat => chat.chatId !== chatId);
  }

  clearChat(): void {
    this._chats = [];
  }

  validate(): void {
    if (
      !this._botId ||
      !this._token ||
      !this._name ||
      !this._type
    ) {
      throw new SsshException(ExceptionEnum.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (const chat of this._chats) {
      if (chat.type != this._type) {
        this.logger.error("ChatBot.validate() - 하위 채팅방의 타입이 상위 챗봇과 일치하지 않습니다.");
        throw new SsshException(ExceptionEnum.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  toDto(): ReadChatBotDto {
    return {
      id: this._id,
      botId: this._botId,
      token: this._token,
      name: this._name,
      description: this._description,
      type: this._type,
      chats: this._chats.map(chat => chat.toDto()),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    }
  }
}

/**
 * MessengerType 열거형
 */
export enum MessengerType {
  TELEGRAM = 'TELEGRAM',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD',
}
