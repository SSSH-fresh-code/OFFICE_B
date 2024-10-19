import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CHAT_REPOSITORY } from "../chatbot.const";
import { MessengerType } from "../domain/chatbot.entity";
import {
	Page,
	PagingService,
} from "../../../infrastructure/common/services/paging.service";
import { CreateChatDto } from "../presentation/dto/create-chat.dto";
import { IChatRepository } from "../infrastructure/chat.repository";
import { ReadChatDto } from "../presentation/dto/read-chat.dto";
import { Chat } from "../domain/chat.entity";
import { ChatPagingDto } from "../presentation/dto/chat-paging.dto";
import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { Chat as PrismaChat } from "@prisma/client";

@Injectable()
export class ChatService {
	constructor(
		@Inject(CHAT_REPOSITORY) private readonly repostiroy: IChatRepository,
		private readonly pagingService: PagingService<PrismaChat>,
	) {}

	/**
	 * 채팅을 생성합니다.
	 *
	 * 주어진 `CreateChatDto`를 기반으로 새로운 채팅을 생성합니다.
	 * `Chat` 엔티티를 생성하고 유효성을 검사한 후 저장합니다.
	 *
	 * @param {CreateChatDto} dto - 생성할 채팅에 대한 정보
	 * @returns {Promise<ReadChatDto>} 생성된 채팅을 반환하는 Promise
	 * @throws ValidationException - 유효성 검사에 실패한 경우 발생
	 */
	async createChat(dto: CreateChatDto): Promise<ReadChatDto> {
		const chat = new Chat(0, dto.chatId, dto.name, MessengerType[dto.type]);

		chat.validate(); // 유효성 검사

		const createdChat = await this.repostiroy.createChat(chat);

		return createdChat.toDto();
	}

	/**
	 * 채팅을 삭제합니다.
	 *
	 * 주어진 `id`에 해당하는 채팅을 삭제합니다.
	 * 만약 존재하지 않는 `id`가 주어질 경우 예외를 발생시킵니다.
	 *
	 * @param {number} id - 삭제할 채팅의 ID
	 * @returns {Promise<void>} 삭제 완료 후 void 반환
	 * @throws NotFoundException - 주어진 ID에 해당하는 채팅이 없는 경우 발생
	 */
	async deleteChat(id: number): Promise<void> {
		await this.repostiroy.deleteChat(id);
	}

	/**
	 * 타입으로 채팅을 조회합니다.
	 *
	 * 주어진 메신저 타입에 따른 채팅을 페이징 방식으로 조회합니다.
	 * `ChatPagingDto`를 통해 검색 조건을 전달받으며, 조건이 없을 경우 예외를 발생시킵니다.
	 *
	 * @param {ChatPagingDto} dto - 조회할 조건을 담은 DTO
	 * @returns {Promise<Page<ReadChatDto>>} 페이징된 채팅 결과를 반환하는 Promise
	 * @throws SsshException - type이 없을 경우 발생하는 예외
	 */
	async getChatsByType(dto: ChatPagingDto): Promise<Page<ReadChatDto>> {
		/** type이 존재하지 않는 경우 조회하지 않음 */
		if (!dto.where__type) {
			throw new SsshException(
				ExceptionEnum.PARAMETER_NOT_FOUND,
				HttpStatus.BAD_REQUEST,
				{ param: "type" },
			);
		}

		const where: Record<string, string> = {};

		if (dto.where__type) {
			where.where__type = dto.where__type;
		}

		const orderBy = {};

		if (dto.orderby) orderBy[dto.orderby] = dto.direction;

		const pagingChats = await this.pagingService.getPagedResults(
			"Chat",
			dto,
			where,
		);

		return {
			data: pagingChats.data.map((chat) => Chat.of(chat).toDto()),
			info: pagingChats.info,
		};
	}

	/**
	 * ID로 채팅을 조회합니다.
	 *
	 * 주어진 `id`에 해당하는 채팅을 조회하여 반환합니다.
	 * 해당 ID에 해당하는 채팅이 존재하지 않을 경우 예외를 발생시킵니다.
	 *
	 * @param {number} id - 조회할 채팅의 ID
	 * @returns {Promise<ReadChatDto>} 조회된 채팅 엔티티를 반환하는 Promise
	 * @throws NotFoundException - 주어진 ID에 해당하는 채팅이 없는 경우 발생
	 */
	async getChatById(id: number): Promise<ReadChatDto> {
		const chat = await this.repostiroy.findChatById(id);

		return chat.toDto();
	}
}
