import {ApiProperty} from '@nestjs/swagger';
import {IsDate, IsString} from 'class-validator';

export class ReadTopicDto {
  @ApiProperty({
    description: '토픽 id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '토픽 이름',
    example: 'sample',
  })
  @IsString()
  name: string;

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
