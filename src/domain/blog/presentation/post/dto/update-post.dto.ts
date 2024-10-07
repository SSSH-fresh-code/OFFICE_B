import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePostDto {
	@ApiProperty({
		description: "게시글 아이디",
		example: 1,
	})
	@IsNumber()
	id: number;

	@IsOptional()
	@ApiProperty({
		description: "게시글 제목",
		example: "sample",
	})
	@IsString()
	title?: string;

	@IsOptional()
	@ApiProperty({
		description: "게시글 내용",
		example: "sample",
	})
	@IsString()
	content?: string;

	@ApiProperty({
		description: "게시글 썸네일",
		example: "",
	})
	@IsOptional()
	@IsString()
	thumbnail?: string;

	@IsOptional()
	@ApiProperty({
		description: "유저 name",
		example: "",
	})
	@IsString()
	authorName?: string;

	@IsOptional()
	@ApiProperty({
		description: "토픽 id",
		example: 1,
	})
	@IsNumber()
	topicId?: number;

	@ApiProperty({
		description: "시리즈 id",
		example: 1,
	})
	@IsOptional()
	@IsNumber()
	seriesId?: number;
}
