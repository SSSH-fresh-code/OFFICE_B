import { ApiProperty } from "@nestjs/swagger";

export class ReadChatLogDto {
	@ApiProperty({
		description: "ChatLog ID (내부 식별자)",
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: "발송자의 ID",
		example: "f38a3c1b-4a3d-432a-bc7f-b3a0a1d09ebf",
	})
	senderId: string;

	@ApiProperty({
		description: "발송자의 이름",
		example: "John Doe",
	})
	senderName: string;

	@ApiProperty({
		description: "봇의 ID",
		example: 10,
	})
	botId: number;

	@ApiProperty({
		description: "봇의 이름",
		example: "ExampleBot",
	})
	botName: string;

	@ApiProperty({
		description: "채팅방 ID (내부 식별자)",
		example: 100,
	})
	chatId: number;

	@ApiProperty({
		description: "채팅방 이름",
		example: "General Chat",
	})
	chatName: string;

	@ApiProperty({
		description: "메시지 내용",
		example: "Hello, world!",
	})
	message: string;

	@ApiProperty({
		description: "메시지 생성일",
		example: "2023-10-19T12:34:56.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "메시지 수정일",
		example: "2023-10-20T08:22:33.000Z",
		required: false,
	})
	updatedAt?: Date;
}
