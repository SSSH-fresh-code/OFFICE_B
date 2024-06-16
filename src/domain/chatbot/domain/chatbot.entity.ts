import { Chat } from './chat.entity';
import { iChatBot } from './chatbot.interface';

/**
 * ChatBot 엔티티 클래스
 */
export class ChatBot implements iChatBot {
  private _chats: Chat[];

  constructor(
    private _id: number,
    private _botId: string,
    private _token: string,
    private _name: string,
    private _description: string,
    private _permission: string,
    private _type: ChatBotType,
    chats: Chat[] = [],
  ) {
    this._chats = chats;
  }

  validate(): void {
    throw new Error("not implements");
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

  /**
   * 토큰 getter
   * @returns string 토큰
   */
  get token(): string {
    return this._token;
  }

  /**
   * 이름 getter
   * @returns string 봇 이름
   */
  get name(): string {
    return this._name;
  }

  /**
   * 설명 getter
   * @returns string 봇 설명
   */
  get description(): string {
    return this._description;
  }

  /**
   * 권한 getter
   * @returns Permission 권한
   */
  get permission(): string {
    return this._permission;
  }

  /**
   * 타입 getter
   * @returns ChatBotType 봇 타입
   */
  get type(): ChatBotType {
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
}

/**
 * ChatBotType 열거형
 */
export enum ChatBotType {
  TELEGRAM = 'TELEGRAM',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD',
}