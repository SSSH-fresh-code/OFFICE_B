import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiProperty({
    description: '권한 이름',
    example: 'create_user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '권한 설명',
    example: 'Allows creating a new user',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}