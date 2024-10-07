import { Chat } from "../domain/chat.entity";
import { MessengerType } from "../domain/chatbot.entity";

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
	deleteChat(id: number): Promise<void>;

	/**
	 * Type에 맞는 채팅을 모두 가져옵니다.
	 * @param type: MessengerType
	 */
	findChatsByType(type: MessengerType): Promise<Chat[]>;
}
