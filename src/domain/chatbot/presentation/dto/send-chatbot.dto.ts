import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber} from 'class-validator';

export class SendChatBotDto {
  @ApiProperty({
    description: '챗봇 id(internal)',
    example: 1,
  })
  @IsNumber()
  botId: number;

  @ApiProperty({
    description: '채팅 id(internal)',
    example: 1,
  })
  @IsNumber()
  chatId: number;

  @ApiProperty({
    description: '전송할 메세지',
    example: '테스트 메세지 입니다.',
  })
  @IsString()
  message: string;
}
