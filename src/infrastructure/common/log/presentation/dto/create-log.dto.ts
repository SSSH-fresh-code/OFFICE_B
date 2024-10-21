import { ApiProperty } from "@nestjs/swagger";

export class CreateLogDto {
	@ApiProperty({
		description: "업무 타입",
		example: "SERVER_NOTIFY",
	})
	businessType: string;

	@ApiProperty({
		description: "데이터 타입",
		example: "JSON",
	})
	dataType: string;

	@ApiProperty({
		description: "로그 데이터",
		example: '{"userId": "1234", "action": "register"}',
	})
	data: string;
}
