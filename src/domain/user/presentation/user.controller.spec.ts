import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPagingDto } from './dto/user-paging.dto';
import { User } from '../domain/user.entity';

/**
 * Mock User Service
 * 유저 서비스의 Mock 함수들을 정의합니다.
 */
const mockUserService = () => ({
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn()
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
    it('유저를 성공적으로 생성해야 합니다.', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      const user = new User('1', 'test@example.com', 'password123', 'Test User');
      userService.createUser.mockResolvedValue(user);

      const result = await userController.createUser(createUserDto);
      expect(result).toEqual(user);
      expect(userService.createUser).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });

    it('유저 생성에 실패하면 에러를 던져야 합니다.', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      userService.createUser.mockRejectedValue(new Error('유저 생성 실패'));

      await expect(userController.createUser(createUserDto)).rejects.toThrow('유저 생성 실패');
    });
  });

  describe('updateUser', () => {
    it('유저를 성공적으로 업데이트해야 합니다.', async () => {
      const updateUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Updated User' };
      const user = new User('1', 'test@example.com', 'password123', 'Updated User');
      userService.updateUser.mockResolvedValue(user);

      const result = await userController.updateUser('1', updateUserDto);
      expect(result).toEqual(user);
      expect(userService.updateUser).toHaveBeenCalledWith('1', 'Updated User');
    });

    it('유저를 찾을 수 없으면 에러를 던져야 합니다.', async () => {
      const updateUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Updated User' };
      userService.updateUser.mockRejectedValue(new Error('유저를 찾을 수 없습니다'));

      await expect(userController.updateUser('1', updateUserDto)).rejects.toThrow('유저를 찾을 수 없습니다');
    });
  });

  describe('getUsers', () => {
    it('페이징된 유저 목록을 성공적으로 반환해야 합니다.', async () => {
      const pagingDto: UserPagingDto = { page: 1, take: 10 };
      const users = [new User('1', 'test1@example.com', 'password123', 'Test User 1')];
      const total = 1;
      userService.getUsers.mockResolvedValue({ data: users, total });

      const result = await userController.getUsers(pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(userService.getUsers).toHaveBeenCalledWith(pagingDto);
    });

    it('필터와 정렬이 포함된 페이징된 유저 목록을 성공적으로 반환해야 합니다.', async () => {
      const pagingDto: UserPagingDto = { page: 1, take: 10, where__email: 'test1@example.com', like__name: 'Test', orderby: 'name', direction: 'asc' };
      const users = [new User('1', 'test1@example.com', 'password123', 'Test User 1')];
      const total = 1;
      userService.getUsers.mockResolvedValue({ data: users, total });

      const result = await userController.getUsers(pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(userService.getUsers).toHaveBeenCalledWith(pagingDto);
    });
  });

  describe('getUserById', () => {
    it('ID로 유저를 성공적으로 조회해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'Test User');

      userService.getUserById.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      const result = await userController.getUserById('1');
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(userService.getUserById).toHaveBeenCalledWith('1');
    });

    it('유저를 찾을 수 없으면 에러를 던져야 합니다.', async () => {
      userService.getUserById.mockRejectedValue(new Error('User not found'));

      await expect(userController.getUserById('1')).rejects.toThrow("User not found");
    });
  });
});