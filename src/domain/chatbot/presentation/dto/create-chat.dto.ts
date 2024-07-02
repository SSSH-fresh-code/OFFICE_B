import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { MessengerType } from "../../domain/chatbot.entity";

export class CreateChatDto {
  @ApiProperty({
    description: '챗 id(External)',
    example: '7370599112',
  })
  @IsString()
  chatId: string;

  @ApiProperty({
    description: '챗 이름(Internal)',
    example: '주가 알리미 톡',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '챗 타입(Internal)',
    example: '챗 타입',
  })
  @IsEnum(MessengerType)
  type: string;
}
