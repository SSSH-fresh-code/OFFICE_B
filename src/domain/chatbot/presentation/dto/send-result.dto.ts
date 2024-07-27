import {ApiProperty} from '@nestjs/swagger';
import {ReadChatBotDto} from './read-chatbot.dto';
import {ReadChatDto} from './read-chat.dto';

export class SendResultDto {
  @ApiProperty({
    description: '성공여부',
    example: true,
  })
  isSuccess: boolean;

  @ApiProperty({
    description: '전송 메세지',
    example: '테스트 메세지 입니다.',
  })
  message: string;

  @ApiProperty({
    description: '전송 챗봇',
  })
  chatbot: ReadChatBotDto;

  @ApiProperty({
    description: '전송된 채팅 정보',
  })
  chat: ReadChatDto;
}
