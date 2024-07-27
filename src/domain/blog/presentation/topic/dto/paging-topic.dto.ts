import {ApiProperty} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';
import {PagingDto} from 'src/infrastructure/common/dto/paging.dto';

export class PagingTopicDto extends PagingDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이름 필터링(부분 일치)',
    example: '',
    required: false,
  })
  like__name?: string;
}
