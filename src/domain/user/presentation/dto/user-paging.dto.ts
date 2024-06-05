// src/domain/user/dto/user-paging.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { PagingDto } from '../../../../infrastructure/dto/paging.dto';

/**
 * 유저 페이징 DTO 클래스
 */
export class UserPagingDto extends PagingDto {
  @IsOptional()
  @IsString()
  where__email?: string;

  @IsOptional()
  @IsString()
  like__name?: string;
}