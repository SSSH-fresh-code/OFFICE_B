import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateSeriesDto {
	@ApiProperty({
		description: "시리즈 이름",
		example: "sample",
	})
	@IsString()
	name: string;

	@ApiProperty({
		description: "토픽 id",
		example: 1,
	})
	@IsNumber()
	topicId: number;
}
