import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class UpdateUserPermissonDto {
	@ApiProperty({
		description: "user의 PK(uuid)",
		example: "",
	})
	@IsUUID()
	id: string;

	@ApiProperty({
		description: "권한 정보 리스트",
		example: "[]",
	})
	@IsArray()
	permissions: string[];
}
