import {ApiProperty} from '@nestjs/swagger';
import {IsDate, IsObject, IsOptional, IsString} from 'class-validator';
import {ReadTopicDto} from '../../topic/dto/read-topic.dto';
import {ReadSeriesDto} from '../../series/dto/read-series.dto';
import {ReadUserDto} from 'src/domain/user/presentation/dto/read-user.dto';

export class ReadPostDto {
  @ApiProperty({
    description: '게시글 id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '게시글 제목',
    example: 'sample',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: 'sample',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 썸네일',
    example: 'sample',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({
    description: '게시글 작성자',
    example: {},
  })
  @IsObject()
  author: ReadUserDto;

  @ApiProperty({
    description: '게시글 주제',
    example: {},
  })
  @IsObject()
  topic: ReadTopicDto;

  @ApiProperty({
    description: '게시글 시리즈',
    example: {},
  })
  @IsOptional()
  @IsObject()
  series?: ReadSeriesDto;

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
