import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({
    description: '토픽 이름',
    example: 'sample',
  })
  @IsString()
  name: string;
}
