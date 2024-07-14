import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class CreateTopicDto {
  @ApiProperty({
    description: '토픽 이름',
    example: "sample",
  })
  @IsString()
  @Length(0, 50)
  name: string;
}
