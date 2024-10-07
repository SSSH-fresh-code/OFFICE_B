import { ApiProperty } from "@nestjs/swagger";
import { MessengerType } from "../../domain/chatbot.entity";
export class ReadChatDto {
	@ApiProperty({
		description: "챗 ID(internal)",
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: "챗 ID(external)",
		example: "723eff1019d1028",
	})
	chatId: string;

	@ApiProperty({
		description: "챗 이름(internal)",
		example: "token",
	})
	name: string;

	@ApiProperty({
		description: "챗 타입(internal)",
		example: MessengerType.TELEGRAM,
	})
	type: MessengerType;

	@ApiProperty({
		description: "챗 생성일",
		example: "2023-01-01T00:00:00.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "챗 수정일",
		example: "2023-01-01T00:00:00.000Z",
	})
	updatedAt: Date;
}
