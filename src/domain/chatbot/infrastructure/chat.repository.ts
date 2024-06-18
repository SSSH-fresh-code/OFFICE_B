import { Chat } from "../domain/chat.entity";

/**
 * IChatRepository 인터페이스
 */
export interface IChatRepository {
  /**
   * 채팅을 생성합니다.
   * @param chat 채팅 엔티티
   * @returns 생성된 채팅
   */
  createChat(chat: Chat): Promise<Chat>;

  /**
   * 채팅을 삭제합니다.
   * @param id 채팅 ID
   */
  deleteChat(id: string): Promise<void>;
}