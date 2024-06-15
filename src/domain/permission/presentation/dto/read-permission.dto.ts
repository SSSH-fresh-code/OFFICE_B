import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../domain/permission.entity';

export class ReadPermissionDto {
  @ApiProperty({
    description: '권한 이름',
    example: 'create_user',
  })
  name: string;

  @ApiProperty({
    description: '권한 설명',
    example: 'Allows creating a new user',
  })
  description?: string;

  @ApiProperty({
    description: '생성 일자',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일자',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(permission: Permission) {
    this.name = permission.name;
    this.description = permission.description;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}