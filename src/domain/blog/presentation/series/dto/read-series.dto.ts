import {ApiProperty} from '@nestjs/swagger';
import {IsDate, IsObject, IsString} from 'class-validator';
import {ReadTopicDto} from '../../topic/dto/read-topic.dto';

export class ReadSeriesDto {
  @ApiProperty({
    description: '시리즈 id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '시리즈 이름',
    example: 'sample',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '시리즈 주제',
    example: {},
  })
  @IsObject()
  topic: ReadTopicDto;

  @ApiProperty({
    description: '생성 일시',
    example: new Date(),
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    example: new Date(),
  })
  @IsDate()
  updatedAt: Date;
}
