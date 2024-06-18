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

  /**
   * 특정 챗봇에 연결된 모든 채팅을 조회합니다.
   * @param chatBotId 챗봇 ID
   * @returns 특정 챗봇에 연결된 모든 채팅
   */
  findChatsByChatBotId(chatBotId: string): Promise<Chat[]>;

  /**
   * ID로 채팅을 조회합니다.
   * @param id 채팅 ID
   * @returns 조회된 채팅
   */
  findChatById(id: string): Promise<Chat>;
}