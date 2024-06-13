import { Controller, Post, Body, Param, Put, Query, Get } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPagingDto } from './dto/user-paging.dto';
import { User } from '../domain/user.entity';
import { ReadUserDto } from './dto/read-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPermissonDto } from './dto/update-userPermission.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: '신규 유저 생성' })
  @ApiResponse({
    status: 201,
    description: '유저가 정상적으로 생성 됨',
  })
  @ApiResponse({ status: 400, description: '잘못된 파라미터 값' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;
    return this.userService.createUser(email, password, name);
  }

  @Put('permission')
  @ApiOperation({ summary: '유저 권한 수정' })
  @ApiResponse({
    status: 200,
    description: '유저 권한이 정상적으로 수정됨'
  })

  @ApiResponse({ status: 400, description: '존재하지 않는 유저' })
  @ApiBody({ type: UpdateUserPermissonDto })
  async updateUserPermission(@Body() dto: UpdateUserPermissonDto) {
    return this.userService.updateUserPermission(dto.id, dto.permissions);
  }
  @Put(':id')
  @ApiOperation({ summary: '기존 유저 수정' })
  @ApiResponse({
    status: 200,
    description: '유저가 정상적으로 수정됨',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 유저' })
  @ApiBody({ type: UpdateUserDto })
  async updateUserName(
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.userService.updateUserName(updateUserDto);
  }

  @Get()
  @ApiOperation({ summary: '유저 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '유저 목록이 정상적으로 조회됨',
  })
  async getUsers(@Query() pagingDto: UserPagingDto): Promise<{ data: User[]; total: number }> {
    return this.userService.getUsers(pagingDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '유저 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '유저 정보가 정상적으로 조회됨',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 유저' })
  async getUserById(@Param('id') id: string): Promise<ReadUserDto> {
    return this.userService.getUserById(id);
  }

}