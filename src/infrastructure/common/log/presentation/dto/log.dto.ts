import { ApiProperty } from "@nestjs/swagger";

export class LogDto {
	@ApiProperty({
		description: "로그의 UUID",
		example: "a1e5a1e8-62c1-4dbe-9085-dfebc46f30d2",
	})
	id: string;

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

	@ApiProperty({
		description: "로그가 생성된 일시",
		example: "2024-10-19T12:34:56.000Z",
	})
	logDate: Date;
}
