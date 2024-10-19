import { Chat } from "../domain/chat.entity";
import { MessengerType } from "../domain/chatbot.entity";

/**
 * IChatRepository 인터페이스
 *
 * 채팅 데이터베이스에 대한 CRUD 작업을 처리하는 인터페이스입니다.
 */
export interface IChatRepository {
	/**
	 * 새로운 채팅을 생성합니다.
	 *
	 * 이 메서드는 주어진 `Chat` 엔티티를 기반으로 새로운 채팅을 생성하고,
	 * 데이터베이스에 저장된 후 그 결과를 반환합니다.
	 *
	 * @param chat - 생성할 채팅 엔티티
	 * @returns 생성된 채팅 엔티티를 포함한 Promise
	 */
	createChat(chat: Chat): Promise<Chat>;

	/**
	 * 채팅을 삭제합니다.
	 *
	 * 이 메서드는 주어진 ID에 해당하는 채팅을 데이터베이스에서 삭제합니다.
	 * 존재하지 않는 ID가 주어지면 예외를 발생시킵니다.
	 *
	 * @param id - 삭제할 채팅의 고유 ID
	 * @returns 삭제 작업이 완료된 후 void를 반환하는 Promise
	 * @throws NotFoundException - 주어진 ID에 해당하는 채팅이 없는 경우 발생
	 */
	deleteChat(id: number): Promise<void>;

	/**
	 * 주어진 메신저 타입에 해당하는 모든 채팅을 가져옵니다.
	 *
	 * 이 메서드는 주어진 `MessengerType`에 해당하는 모든 채팅을
	 * 데이터베이스에서 조회하여 반환합니다.
	 *
	 * @param type - 조회할 채팅의 메신저 타입
	 * @returns 해당 메신저 타입에 속하는 채팅 목록을 포함한 Promise
	 */
	findChatsByType(type: MessengerType): Promise<Chat[]>;

	/**
	 * ID로 특정 채팅방을 조회합니다.
	 *
	 * 주어진 `id`에 해당하는 채팅을 데이터베이스에서 조회하여 반환합니다.
	 * 만약 해당 ID에 대한 채팅이 존재하지 않으면 예외를 발생시킵니다.
	 *
	 * @param id - 조회할 채팅의 고유 ID
	 * @returns 해당 ID에 해당하는 채팅 엔티티를 포함한 Promise
	 * @throws NotFoundException - 주어진 ID에 해당하는 채팅이 없는 경우 발생
	 */
	findChatById(id: number): Promise<Chat>;
}
