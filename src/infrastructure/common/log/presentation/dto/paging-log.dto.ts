import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PagingDto } from "src/infrastructure/common/dto/paging.dto";

export class PagingLogDto extends PagingDto {
	@IsOptional()
	@IsString()
	@ApiProperty({
		description: "업무 타입 필터링(부분 일치)",
		example: "USER_REGISTRATION",
		required: false,
	})
	where__businessType?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: "데이터 타입 필터링(부분 일치)",
		example: "JSON",
		required: false,
	})
	where__dataType?: string;
}
