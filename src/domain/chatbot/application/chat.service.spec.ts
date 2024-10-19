import { Test, TestingModule } from "@nestjs/testing";
import { PagingService } from "../../../infrastructure/common/services/paging.service";
import { CHAT_REPOSITORY, MESSENGER_FACTORY } from "../chatbot.const";
import { PrismaChatBotRepository } from "../../../infrastructure/db/repositories/prisma-chatbot.repository";
import { ChatBot, MessengerType } from "../domain/chatbot.entity";
import { MessengerFactory } from "../infrastructure/messenger.factory";
import { ChatService } from "./chat.service";
import { Chat } from "../domain/chat.entity";
import { CreateChatDto } from "../presentation/dto/create-chat.dto";
import { LoggerModule } from "../../../infrastructure/module/logger.module";
import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { HttpStatus } from "@nestjs/common";
import { ChatPagingDto } from "../presentation/dto/chat-paging.dto";
import { PrismaChatRepository } from "src/infrastructure/db/repositories/prisma-chat.repository";

/**
 * Mock User Repository
 * 유저 저장소의 Mock 함수들을 정의합니다.
 */
const mockChatRepository = () => ({
	createChat: jest.fn(),
	deleteChat: jest.fn(),
	findChatsByType: jest.fn(),
	findChatById: jest.fn(),
});

const mockMessengerFactory = () => ({
	getMessengerService: jest.fn(),
});
/**
 * Mock Paging Service
 * 페이징 서비스의 Mock 함수들을 정의합니다.
 */
const mockPagingService = () => ({
	getPagedResults: jest.fn(),
});

describe("ChatBotService", () => {
	let chatService: ChatService;
	let chatRepository: jest.Mocked<PrismaChatRepository>;
	let pagingService: jest.Mocked<PagingService<Chat>>;
	let messengerFactory: jest.Mocked<MessengerFactory>;

	const chatId = "7370566619";
	const name = "chatbot";
	const type = MessengerType.DISCORD;

	let chat: Chat;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule],
			providers: [
				{
					provide: MESSENGER_FACTORY,
					useFactory: mockMessengerFactory,
				},
				{ provide: CHAT_REPOSITORY, useFactory: mockChatRepository },
				{ provide: PagingService, useFactory: mockPagingService },
				ChatService,
			],
		}).compile();

		chatService = module.get<ChatService>(ChatService);
		chatRepository = module.get<PrismaChatRepository>(
			CHAT_REPOSITORY,
		) as jest.Mocked<PrismaChatRepository>;
		pagingService = module.get<PagingService<Chat>>(
			PagingService,
		) as jest.Mocked<PagingService<Chat>>;
		messengerFactory = module.get<MessengerFactory>(
			MESSENGER_FACTORY,
		) as jest.Mocked<MessengerFactory>;
	});

	beforeEach(() => {
		chat = new Chat(1, chatId, name, type);
	});

	describe("createChat - 챗봇 생성", () => {
		it("챗봇을 정상적으로 생성합니다.", async () => {
			const dto: CreateChatDto = {
				chatId,
				name,
				type,
			};

			chatRepository.createChat.mockResolvedValue(chat);

			const createdChat = await chatService.createChat(dto);

			expect(createdChat).toEqual(chat.toDto());
			expect(chatRepository.createChat).toHaveBeenCalledWith(
				new Chat(0, dto.chatId, dto.name, MessengerType[dto.type]),
			);
		});

		it("ChatId 없는 경우", async () => {
			const dto: CreateChatDto = {
				chatId: null,
				name,
				type,
			};

			await expect(() => chatService.createChat(dto)).rejects.toThrow(
				new SsshException(
					ExceptionEnum.INTERNAL_SERVER_ERROR,
					HttpStatus.INTERNAL_SERVER_ERROR,
				),
			);
		});

		it("Chat name 없는 경우", async () => {
			const dto: CreateChatDto = {
				chatId,
				name: null,
				type,
			};

			await expect(() => chatService.createChat(dto)).rejects.toThrow(
				new SsshException(
					ExceptionEnum.INTERNAL_SERVER_ERROR,
					HttpStatus.INTERNAL_SERVER_ERROR,
				),
			);
		});
	});

	describe("deleteChat - 채팅 삭제", () => {
		it("채팅을 삭제합니다.", async () => {
			try {
				await chatService.deleteChat(1);
				expect(true).toBeTruthy();
			} catch (e) {
				expect(false).toBeTruthy();
			}
		});
	});

	describe("findChatsByType - 채팅 타입 조회", () => {
		it("타입으로 채팅을 조회합니다.", async () => {
			const chat = new Chat(1, chatId, name, type);

			const dto: ChatPagingDto = {
				where__type: MessengerType.DISCORD,
				page: 1,
				take: 10,
				orderby: "createdAt",
				direction: "desc",
			};

			pagingService.getPagedResults.mockResolvedValue({
				data: [chat],
				info: {
					total: 1,
					current: 1,
					last: 1,
					take: 10,
				},
			});

			const chats = await chatService.getChatsByType(dto);

			expect(pagingService.getPagedResults).toHaveBeenCalledWith("Chat", dto, {
				type: MessengerType.DISCORD,
			});

			expect(chats.info.total).toEqual(1);
		});

		it("type없이 조회", async () => {
			const dto: ChatPagingDto = {
				page: 1,
				take: 10,
				orderby: "createdAt",
				direction: "desc",
			};

			await expect(() => chatService.getChatsByType(dto)).rejects.toThrow(
				new SsshException(
					ExceptionEnum.PARAMETER_NOT_FOUND,
					HttpStatus.BAD_REQUEST,
					{ param: "type" },
				),
			);
		});
	});

	describe("getChatBotById", () => {
		it("id로 챗봇을 조회합니다.", async () => {
			const chat = new Chat(1, chatId, name, type);

			chatRepository.findChatById.mockResolvedValue(chat);

			const selectedChat = await chatService.getChatById(1);

			expect(selectedChat.id).toEqual(chat.id);
			expect(chatRepository.findChatById).toHaveBeenCalledWith(1);
		});
	});
});
