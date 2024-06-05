// src/infrastructure/dto/paging.dto.ts
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 공통 페이징 DTO 클래스
 */
export class PagingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 10;

  @IsOptional()
  @IsString()
  orderby?: string;

  @IsOptional()
  @IsString()
  direction?: 'ASC' | 'DESC' = 'DESC';
}