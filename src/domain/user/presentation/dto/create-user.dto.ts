import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strongPassword123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '생성과 동시에 필요한 권한 리스트',
    example: '["1", "2"]',
  })
  @IsOptional()
  permissions?: string[];
}
