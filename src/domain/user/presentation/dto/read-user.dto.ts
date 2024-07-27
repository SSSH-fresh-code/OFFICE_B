import {ApiProperty} from '@nestjs/swagger';

export class ReadUserDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: '계정 생성일',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '계정 수정일',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
