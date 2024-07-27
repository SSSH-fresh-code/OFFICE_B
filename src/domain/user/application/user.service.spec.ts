import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from './user.service';
import {UserRepository} from '../infrastructure/user.repository';
import {USER_REPOSITORY} from '../user.const';
import {User} from '../domain/user.entity';
import {PagingService} from '../../../infrastructure/common/services/paging.service';
import {v4 as uuidv4} from 'uuid';

/**
 * Mock User Repository
 * 유저 저장소의 Mock 함수들을 정의합니다.
 */
const mockUserRepository = () => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  getPermissionByUser: jest.fn(),
  setPermission: jest.fn(),
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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {provide: USER_REPOSITORY, useFactory: mockUserRepository},
        {provide: PagingService, useFactory: mockPagingService},
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
    pagingService = module.get<PagingService<User>>(PagingService);
  });

  // 기존 테스트 코드

  describe('getUserByEmailForLogin', () => {
    it('이메일로 유저를 성공적으로 조회해야 합니다.', async () => {
      const user = new User(
        '1',
        'test@example.com',
        'password123',
        'TestUser',
        [],
        new Date(),
        new Date(),
      );
      userRepository.findByEmail.mockResolvedValue(user);
      userRepository.getPermissionByUser.mockResolvedValue(user);

      const result =
        await userService.getUserByEmailForLogin('test@example.com');
      expect(result).toEqual(user);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(userRepository.getPermissionByUser).toHaveBeenCalledWith(user);
    });

    it('유저를 찾을 수 없으면 에러를 던져야 합니다.', async () => {
      userRepository.findByEmail.mockRejectedValue(
        new Error('유저를 찾을 수 없습니다.'),
      );

      await expect(
        userService.getUserByEmailForLogin('test@example.com'),
      ).rejects.toThrow('유저를 찾을 수 없습니다.');
    });
  });

  describe('updateUserPermission', () => {
    it('권한 목록을 받아 유저의 권한을 수정합니다.', async () => {
      const permissions = ['TEST0001'];
      const user = new User(
        uuidv4(),
        'test@example.com',
        'password123',
        'TestUser',
      );
      const hasPermissionUser = new User(
        user.id,
        'test@example.com',
        'password123',
        'TestUser',
        permissions,
      );
      userRepository.findById.mockResolvedValue(user);
      userRepository.setPermission.mockResolvedValue(hasPermissionUser);

      const result = await userService.updateUserPermission(
        user.id,
        permissions,
      );

      expect(result).toEqual(hasPermissionUser);
      expect(userRepository.findById).toHaveBeenCalledWith(user.id);
      expect(userRepository.setPermission).toHaveBeenCalledWith(
        hasPermissionUser,
      );
    });

    it('권한 목록이 없는 경우 유저의 권한을 초기화 합니다.', async () => {
      const user = new User(
        uuidv4(),
        'test@example.com',
        'password123',
        'TestUser',
        ['LOGIN001'],
      );
      const emptyPermissionUser = new User(
        user.id,
        'test@example.com',
        'password123',
        'TestUser',
        [],
      );
      userRepository.findById.mockResolvedValue(user);
      userRepository.setPermission.mockResolvedValue(emptyPermissionUser);

      const result = await userService.updateUserPermission(user.id, []);

      expect(result).toEqual(emptyPermissionUser);
      expect(userRepository.findById).toHaveBeenCalledWith(user.id);
      expect(userRepository.setPermission).toHaveBeenCalledWith(
        emptyPermissionUser,
      );
    });

    it('없는 유저를 조회하면 에러를 반환합니다.', async () => {
      userRepository.findById.mockRejectedValue(
        new Error('리소스를 찾을 수 없습니다.'),
      );

      await expect(userService.updateUserPermission('', [])).rejects.toThrow(
        '리소스를 찾을 수 없습니다.',
      );
    });
  });
});
