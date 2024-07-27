import {ApiProperty} from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import {MessengerType} from '../../domain/chatbot.entity';

export class UpdateChatBotDto {
  @ApiProperty({
    description: '챗봇 id(Internal)',
    example: '0',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '챗봇 id(External)',
    example: '7370599112',
  })
  @IsString()
  botId: string;

  @ApiProperty({
    description: '챗봇 토큰(External)',
    example: '7345685563:AAFvwnUGTM1OKm9a-qpVk7uSfQq6NZJiTB4',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: '챗봇 이름(Internal)',
    example: '주가 알리미',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '챗봇 설명(Internal)',
    example: '특정 티커의 주가 알리미 챗봇입니다.',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: '챗봇 타입(Internal)',
    example: '챗봇 타입',
  })
  @IsEnum(MessengerType)
  type: string;

  @ApiProperty({
    description: '채팅 아이디 목록(Internal)',
    example: '[]',
  })
  @IsArray()
  chatIds?: number[] = [];
}
