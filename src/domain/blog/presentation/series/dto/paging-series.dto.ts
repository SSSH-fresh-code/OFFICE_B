import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PagingDto } from "src/infrastructure/common/dto/paging.dto";

export class PagingSeriesDto extends PagingDto {
	@IsOptional()
	@IsString()
	@ApiProperty({
		description: "이름 필터링(부분 일치)",
		example: "",
		required: false,
	})
	like__name?: string;

	@ApiProperty({
		description: "상위 주제 id(완전 일치)",
		example: 1,
		required: false,
	})
	@IsOptional()
	where__topicId?: number;
}
