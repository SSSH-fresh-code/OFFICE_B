import { AggregateRoot } from "../../../domain/aggregate-root.interface";

/**
 * ChatBot 인터페이스
 */
export interface iChatBot extends AggregateRoot {
  /**
   * Chatbot이 현재 사용가능한 상태인지 체크합니다.
   */
  isAlive(): void;

  /**
   * 채팅 추가 메서드
   * @param chat 추가할 채팅
   */
  addChat(chat: iChatBot): void

  /**
   * 채팅 삭제 메서드
   * @param chatId 삭제할 채팅의 ID
   */
  removeChat(chatId: string): void
}
