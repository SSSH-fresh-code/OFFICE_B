import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from '../domain/user.entity';
import { ExceptionEnum } from '../../../infrastructure/filter/exception/exception.enum';

/**
 * Mock User Service
 * 유저 서비스의 Mock 함수들을 정의합니다.
 */
const mockUserService = () => ({
  getUserByEmailForLogin: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('validateUser', () => {
    it('유저를 성공적으로 인증해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'TestUser', ["LOGIN001"]);
      userService.getUserByEmailForLogin.mockResolvedValue(user);
      jest.spyOn(user, 'validatePassword').mockReturnValue(true);

      const result = await authService.validateUser('test@example.com', 'password123');
      expect(result).toEqual(user);
      expect(userService.getUserByEmailForLogin).toHaveBeenCalledWith('test@example.com');
      expect(user.validatePassword).toHaveBeenCalledWith('password123');
    });

    it('유저를 찾을 수 없으면 null을 반환해야 합니다.', async () => {
      userService.getUserByEmailForLogin.mockResolvedValue(null);

      const result = await authService.validateUser('test@example.com', 'password123');
      expect(result).toBeNull();
      expect(userService.getUserByEmailForLogin).toHaveBeenCalledWith('test@example.com');
    });

    it('패스워드가 올바르지 않으면 null을 반환해야 합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'TestUser', ["LOGIN001"]);
      userService.getUserByEmailForLogin.mockResolvedValue(user);
      jest.spyOn(user, 'validatePassword').mockReturnValue(false);

      const result = await authService.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
      expect(userService.getUserByEmailForLogin).toHaveBeenCalledWith('test@example.com');
      expect(user.validatePassword).toHaveBeenCalledWith('wrongpassword');
    });


    it('로그인 권한이 없으면 에러를 반환합니다.', async () => {
      const user = new User('1', 'test@example.com', 'password123', 'TestUser', []);
      userService.getUserByEmailForLogin.mockResolvedValue(user);
      jest.spyOn(user, 'validatePassword').mockReturnValue(false);

      await expect(authService.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(ExceptionEnum.ACCOUNT_WITHOUT_PERMISSION);
    });
  });
});