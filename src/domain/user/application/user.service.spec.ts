import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../infrastructure/user.repository';
import { USER_REPOSITORY } from '../user.const';
import { User } from '../domain/user.entity';
import { UserPagingDto } from '../presentation/dto/user-paging.dto';
import { PagingService } from '../../../infrastructure/services/paging.service';

/**
 * Mock User Repository
 * 유저 저장소의 Mock 함수들을 정의합니다.
 */
const mockUserRepository = () => ({
  save: jest.fn(),
  findById: jest.fn(),
});

/**
 * Mock Paging Service
 * 페이징 서비스의 Mock 함수들을 정의합니다.
 */
const mockPagingService = () => ({
  getPagedResults: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository;
  let pagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useFactory: mockUserRepository },
        { provide: PagingService, useFactory: mockPagingService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
    pagingService = module.get<PagingService<User>>(PagingService);
  });

  describe('createUser', () => {
    it('유저를 성공적으로 생성해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'Test User');
      userRepository.save.mockResolvedValue(user);

      const result = await userService.createUser('test@example.com', 'password123', 'Test User');
      expect(result).toEqual(user);
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it('유저 생성에 실패하면 에러를 던져야 합니다.', async () => {
      userRepository.save.mockRejectedValue(new Error('Failed to create user'));

      await expect(userService.createUser('test@example.com', 'password123', 'Test User')).rejects.toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    it('유저를 성공적으로 업데이트해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'User');
      userRepository.findById.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);

      const result = await userService.updateUser('1', 'Updated');
      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('유저를 찾을 수 없으면 에러를 던져야 합니다.', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('1', 'Updated User')).rejects.toThrow('User not found');
    });
  });

  describe('getUsers', () => {
    it('페이징된 유저 목록을 성공적으로 반환해야 합니다.', async () => {
      const users = [new User('1', 'test1@example.com', 'password123', 'Test User 1')];
      const total = 1;
      const pagingDto = new UserPagingDto();
      pagingService.getPagedResults.mockResolvedValue({ data: users, total });

      const result = await userService.getUsers(pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(pagingService.getPagedResults).toHaveBeenCalledWith('User', pagingDto, {}, {});
    });

    it('필터와 정렬이 포함된 페이징된 유저 목록을 성공적으로 반환해야 합니다.', async () => {
      const users = [new User('1', 'test1@example.com', 'password123', 'Test User 1')];
      const total = 1;
      const pagingDto = new UserPagingDto();
      pagingDto.where__email = 'test1@example.com';
      pagingDto.like__name = 'Test';
      pagingDto.orderby = 'name';
      pagingDto.direction = 'ASC';

      pagingService.getPagedResults.mockResolvedValue({ data: users, total });

      const where = {
        email: 'test1@example.com',
        name: { contains: 'Test' },
      };
      const orderBy = {
        name: 'ASC',
      };

      const result = await userService.getUsers(pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(pagingService.getPagedResults).toHaveBeenCalledWith('User', pagingDto, where, orderBy);
    });
  });
});