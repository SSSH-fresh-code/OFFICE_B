import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../domain/entities/user.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;
    return this.userService.createUser(email, password, name);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user name' })
  @ApiResponse({
    status: 200,
    description: 'The user name has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: CreateUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User | null> {
    return this.userService.updateUser(id, createUserDto.name);
  }
}
