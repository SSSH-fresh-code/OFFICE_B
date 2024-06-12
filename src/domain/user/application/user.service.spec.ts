import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../infrastructure/user.repository';
import { USER_REPOSITORY } from '../user.const';
import { User } from '../domain/user.entity';
import { PagingService } from '../../../infrastructure/services/paging.service';

/**
 * Mock User Repository
 * 유저 저장소의 Mock 함수들을 정의합니다.
 */
const mockUserRepository = () => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  getPermissionByUser: jest.fn()
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

  // 기존 테스트 코드

  describe('getUserByEmailForLogin', () => {
    it('이메일로 유저를 성공적으로 조회해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'TestUser', [], new Date(), new Date());
      userRepository.findByEmail.mockResolvedValue(user);
      userRepository.getPermissionByUser.mockResolvedValue(user);

      const result = await userService.getUserByEmailForLogin('test@example.com');
      expect(result).toEqual(user);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.getPermissionByUser).toHaveBeenCalledWith(user);
    });

    it('유저를 찾을 수 없으면 에러를 던져야 합니다.', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error("유저를 찾을 수 없습니다."));

      await expect(userService.getUserByEmailForLogin('test@example.com')).rejects.toThrow('유저를 찾을 수 없습니다.');
    });
  });

  describe('serializeUser', () => {
    it('유저 ID를 성공적으로 직렬화해야 합니다.', () => {
      const user = new User('1', 'test@example.com', 'password123', 'TestUser');
      const result = userService.serializeUser(user);
      expect(result).toBe(user.id);
    });
  });

  describe('deserializeUser', () => {
    it('유저 ID로 유저를 성공적으로 역직렬화해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'TestUser');
      userRepository.findById.mockResolvedValue(user);

      const result = await userService.deserializeUser('1');
      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('유저를 찾을 수 없으면 에러를 던져야 합니다.', async () => {
      userRepository.findById.mockRejectedValue(new Error('유저를 찾을 수 없습니다.'));

      await expect(userService.deserializeUser('1')).rejects.toThrow('유저를 찾을 수 없습니다.');
    });
  });
});