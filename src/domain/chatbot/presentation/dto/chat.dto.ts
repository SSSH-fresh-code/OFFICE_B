import {ApiProperty} from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ChatDto {
  @ApiProperty({
    description: '챗봇 ID',
    example: '1',
  })
  @IsNumber()
  chatbotId: number;

  @ApiProperty({
    description: '채팅방 id',
    example: '1',
  })
  @IsNumber()
  chatId: number;

  @ApiProperty({
    description: '메세지',
    example: 'Hello World',
  })
  @IsString()
  msg: string;
}
