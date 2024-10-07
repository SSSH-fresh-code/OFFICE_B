import { IsOptional, IsString, IsInt, Min, IsEnum } from "class-validator";
import { PagingDto } from "../../../../infrastructure/common/dto/paging.dto";
import { ApiProperty } from "@nestjs/swagger";
import { MessengerType } from "../../domain/chatbot.entity";

/**
 * 챗봇 페이징 DTO 클래스
 */
export class ChatBotPagingDto extends PagingDto {
	@IsOptional()
	@IsEnum(MessengerType)
	@ApiProperty({
		description: "타입으로 필터링",
		example: "DISCORD",
	})
	where__type?: string;
}
