import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateTopicDto {
	@ApiProperty({
		description: "토픽 id",
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: "토픽 이름",
		example: "sample",
	})
	@IsString()
	name: string;
}
