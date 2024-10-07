import { IsEnum, IsOptional } from "class-validator";
import { MessengerType } from "../../domain/chatbot.entity";
import { ApiProperty } from "@nestjs/swagger";
import { PagingDto } from "../../../../infrastructure/common/dto/paging.dto";
/**
 * 챗 페이징 DTO 클래스
 */
export class ChatPagingDto extends PagingDto {
	@IsOptional()
	@IsEnum(MessengerType)
	@ApiProperty({
		description: "타입으로 필터링",
		example: MessengerType.TELEGRAM,
		required: true,
	})
	where__type?: string;
}
