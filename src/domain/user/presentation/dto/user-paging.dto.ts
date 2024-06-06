import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { PagingDto } from '../../../../infrastructure/dto/paging.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 유저 페이징 DTO 클래스
 */
export class UserPagingDto extends PagingDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이메일 주소로 필터링',
    example: 'user@example.com',
    required: false,
  })
  where__email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이름으로 필터링 (부분 일치)',
    example: 'John',
    required: false,
  })
  like__name?: string;
}