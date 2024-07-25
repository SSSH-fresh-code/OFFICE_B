import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 공통 페이징 DTO 클래스
 */
export class PagingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '페이지 당 항목 수',
    example: 10,
    required: false,
  })
  take?: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '정렬할 필드',
    example: 'name',
    required: false,
  })
  orderby?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '정렬 방향 (ASC 또는 DESC)',
    example: 'desc',
    required: false,
  })
  direction?: 'asc' | 'desc' = 'desc';
}
