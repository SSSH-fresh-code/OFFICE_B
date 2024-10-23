import { ApiProperty } from "@nestjs/swagger";
import { BusinessType, DataType } from "../../domain/log.enum";

export class CreateLogDto {
	@ApiProperty({
		description: "업무 타입",
		example: BusinessType,
	})
	businessType: BusinessType;

	@ApiProperty({
		description: "데이터 타입",
		example: DataType.JSON,
	})
	dataType: DataType;

	@ApiProperty({
		description: "로그 데이터",
		example: '{"userId": "1234", "action": "register"}',
	})
	data: string;
}
