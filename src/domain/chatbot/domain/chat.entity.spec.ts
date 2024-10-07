import { Chat } from "./chat.entity";
import { MessengerType } from "./chatbot.entity";
import { iChat } from "./chat.interface";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";

describe("Chat Entity", () => {
	let chat: iChat;

	beforeEach(() => {
		chat = new Chat(1, "chatId", "name", MessengerType.DISCORD);
	});

	describe("constructor", () => {
		it("유저 엔티티를 성공적으로 생성해야 합니다.", () => {
			expect(chat.id).toEqual(1);
			expect(chat.chatId).toEqual("chatId");
			expect(chat.name).toEqual("name");
			expect(chat.type).toEqual(MessengerType.DISCORD);
		});
	});

	describe("validate", () => {
		it("유효성 검증 실패 시 에러를 던져야 합니다.", () => {
			[
				new Chat(0, "", "name", MessengerType.DISCORD),
				new Chat(0, "chatId", "", MessengerType.SLACK),
			].forEach(async (e) => {
				await expect(() => {
					e.validate();
				}).toThrow(ExceptionEnum.INTERNAL_SERVER_ERROR);
			});
		});
	});
});
