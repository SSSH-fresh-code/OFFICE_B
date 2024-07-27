import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsEmail, IsArray, IsOptional, IsUUID} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'user의 PK(uuid)',
    example: '',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;
}
