import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateSeriesDto {
	@ApiProperty({
		description: "시리즈 id",
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: "시리즈 이름",
		example: "sample",
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({
		description: "토픽 id",
		example: "sample",
	})
	@IsOptional()
	@IsNumber()
	topicId?: number;
}
