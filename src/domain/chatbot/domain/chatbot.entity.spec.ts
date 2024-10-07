import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { Chat } from "./chat.entity";
import { ChatBot, MessengerType } from "./chatbot.entity";
import { iChatBot } from "./chatbot.interface";

describe("ChatBot Entity", () => {
	let chatbot: iChatBot;

	const id = 0;
	const botId = "botId";
	const token = "token";
	const name = "name";
	const description = "description";
	const type = MessengerType.DISCORD;

	beforeEach(() => {
		chatbot = new ChatBot(id, botId, token, name, description, type, []);
	});

	describe("constructor", () => {
		it("유저 엔티티를 성공적으로 생성해야 합니다.", () => {
			expect(chatbot.id).toEqual(id);
			expect(chatbot.botId).toEqual(botId);
			expect(chatbot.token).toEqual(token);
			expect(chatbot.name).toEqual(name);
			expect(chatbot.description).toEqual(description);
			expect(chatbot.type).toEqual(type);
		});
	});

	describe("addChat", () => {
		it("채팅을 추가합니다.", async () => {
			const chat = new Chat(0, "chatId", "name", MessengerType.DISCORD);

			chatbot.addChat(chat);

			expect(chatbot.chats.length).toBe(1);
			expect(chatbot.chats).toEqual([chat]);
		});
	});

	describe("removeChat", () => {
		it("추가되어있는 채팅을 삭제합니다.", async () => {
			const chat = new Chat(0, "chatId", "name", MessengerType.DISCORD);

			chatbot.addChat(chat);
			chatbot.removeChat(chat.chatId);

			expect(chatbot.chats.length).toBe(0);
			expect(chatbot.chats).toEqual([]);
		});

		it("존재하지 않는 채팅을 삭제하는 경우 아무일도 일어나지 않습니다.", async () => {
			const chat = new Chat(0, "chatId", "name", MessengerType.DISCORD);

			chatbot.addChat(chat);
			chatbot.removeChat(chat.chatId + "2");

			expect(chatbot.chats.length).toBe(1);
			expect(chatbot.chats).toEqual([chat]);
		});
	});

	describe("cleatChat", () => {
		it("채팅 목록을 초기화 합니다.", async () => {
			const chat = new Chat(0, "chatId", "name", MessengerType.DISCORD);

			chatbot.addChat(chat);
			chatbot.clearChat();

			expect(chatbot.chats.length).toBe(0);
			expect(chatbot.chats).toEqual([]);
		});
	});

	describe("validate", () => {
		it("유효성 검증 정상 케이스", async () => {
			const chat = new Chat(0, "chatId", "name", MessengerType.DISCORD);

			chatbot.addChat(chat);

			chatbot.validate();

			expect(chatbot).toBeDefined();
		});

		it("유효성 검증 실패 시 에러를 던져야 합니다.", () => {
			const chat = new Chat(0, "chatId", "name", MessengerType.SLACK);

			[
				new ChatBot(0, "", token, name, description, type),
				new ChatBot(0, botId, "", name, description, type),
				new ChatBot(0, botId, token, "", description, type),
				new ChatBot(0, botId, token, name, description, null),
				new ChatBot(0, botId, token, name, description, type, [chat]),
			].forEach(async (e) => {
				await expect(() => {
					e.validate();
				}).toThrow(ExceptionEnum.INTERNAL_SERVER_ERROR);
			});
		});
	});
});
