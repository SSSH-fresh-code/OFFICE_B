import {ApiProperty} from '@nestjs/swagger';
import {MessengerType} from '../../domain/chatbot.entity';
import {ReadChatDto} from './read-chat.dto';
export class ReadChatBotDto {
  @ApiProperty({
    description: '챗봇 ID(internal)',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '챗봇 ID(external)',
    example: '723eff1019d1028',
  })
  botId: string;

  @ApiProperty({
    description: '챗봇 토큰(external)',
    example: 'token',
  })
  token: string;

  @ApiProperty({
    description: '챗봇 이름(internal)',
    example: '테스트 챗봇',
  })
  name: string;

  @ApiProperty({
    description: '챗봇 설명(internal)',
    example: '테스트 챗봇입니다.',
  })
  description: string;

  @ApiProperty({
    description: '챗봇 타입(internal)',
    example: MessengerType.TELEGRAM,
  })
  type: MessengerType;

  @ApiProperty({
    description: '등록된 채팅 리스트',
    example: [],
  })
  chats: ReadChatDto[];

  @ApiProperty({
    description: '챗봇 생성일',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '챗봇 수정일',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
