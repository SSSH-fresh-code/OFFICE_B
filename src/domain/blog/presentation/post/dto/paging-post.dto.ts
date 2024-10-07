import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PagingDto } from "src/infrastructure/common/dto/paging.dto";

export class PagingPostDto extends PagingDto {
	@IsOptional()
	@IsString()
	@ApiProperty({
		description: "제목 필터링(부분 일치)",
		example: "",
		required: false,
	})
	like__title?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: "내용 필터링(부분 일치)",
		example: "",
		required: false,
	})
	like__content?: string;

	@ApiProperty({
		description: "상위 주제 id(완전 일치)",
		example: 1,
		required: false,
	})
	@IsOptional()
	where__topicId?: number;

	@ApiProperty({
		description: "상위 시리즈 id(완전 일치)",
		example: 1,
		required: false,
	})
	@IsOptional()
	where__seriesId?: number;

	@ApiProperty({
		description: "저자 이름(완전 일치)",
		example: "Name",
		required: false,
	})
	@IsOptional()
	where__authorName?: string;
}
