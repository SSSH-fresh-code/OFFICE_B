import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPagingDto } from './dto/user-paging.dto';
import { ReadUserDto } from './dto/read-user.dto';
import { User } from '../domain/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Mock User Service
 * 유저 서비스의 Mock 함수들을 정의합니다.
 */
const mockUserService = () => ({
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
});

describe('UserController', () => {
  let userController: UserController;
  let userService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('유저를 생성해야 합니다.', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'TestUser' };
      const user = new User('1', createUserDto.email, createUserDto.password, createUserDto.name);
      userService.createUser.mockResolvedValue(user);

      expect(await userController.createUser(createUserDto)).toEqual(user);
    });

    it('잘못된 파라미터 값이 주어지면 예외를 던져야 합니다.', async () => {
      const createUserDto: CreateUserDto = { email: '', password: '', name: '' };

      userService.createUser.mockRejectedValue(new HttpException('유저를 생성할 수 없습니다.', HttpStatus.BAD_REQUEST));

      await expect(userController.createUser(createUserDto)).rejects.toThrow('유저를 생성할 수 없습니다.');
    });
  });

  describe('updateUser', () => {
    it('유저를 수정해야 합니다.', async () => {
      const id = '1';
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'TestUser' };
      const updatedUser = new User(id, createUserDto.email, createUserDto.password, createUserDto.name);
      userService.updateUser.mockResolvedValue(updatedUser);

      expect(await userController.updateUser(id, createUserDto)).toEqual(updatedUser);
    });

    it('존재하지 않는 유저 ID가 주어지면 예외를 던져야 합니다.', async () => {
      const id = '999';
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'TestUser' };

      userService.updateUser.mockRejectedValue(new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND));

      await expect(userController.updateUser(id, createUserDto)).rejects.toThrow('유저를 찾을 수 없습니다.');
    });
  });

  describe('getUsers', () => {
    it('유저 목록을 조회해야 합니다.', async () => {
      const pagingDto: UserPagingDto = { page: 1, take: 10 };
      const users: User[] = [
        new User('1', 'test1@example.com', 'password123', 'TestUser1'),
        new User('2', 'test2@example.com', 'password123', 'TestUser2'),
      ];
      const total = users.length;
      userService.getUsers.mockResolvedValue({ data: users, total });

      expect(await userController.getUsers(pagingDto)).toEqual({ data: users, total });
    });
  });

  describe('getUserById', () => {
    it('유저를 ID로 조회해야 합니다.', async () => {
      const id = '1';
      const user = new User(id, 'test@example.com', 'password123', 'TestUser');
      const readUserDto: ReadUserDto = { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt };
      userService.getUserById.mockResolvedValue(readUserDto);

      expect(await userController.getUserById(id)).toEqual(readUserDto);
    });

    it('존재하지 않는 유저 ID가 주어지면 예외를 던져야 합니다.', async () => {
      const id = '999';

      userService.getUserById.mockRejectedValue(new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND));

      await expect(userController.getUserById(id)).rejects.toThrow('유저를 찾을 수 없습니다.');
    });
  });
});