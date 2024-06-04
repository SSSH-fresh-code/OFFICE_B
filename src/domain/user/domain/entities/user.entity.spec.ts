// src/user/domain/entities/user.spec.ts
import { User } from './user.entity';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User('1', 'test@example.com', 'password123', 'username');
  });

  it('비밀번호를 올바르게 설정하고 해시화해야 한다', () => {
    const plainPassword = 'newPassword123';
    user.password = plainPassword;
    expect(user.validatePassword(plainPassword)).toBe(true);
  });

  it('비밀번호를 기본값으로 재설정하고 해시화해야 한다', () => {
    user.resetPassword();
    expect(user.validatePassword('12345678a')).toBe(true);
  });

  it('비밀번호를 올바르게 검증해야 한다', () => {
    const plainPassword = 'password123';
    user.password = plainPassword;
    expect(user.validatePassword(plainPassword)).toBe(true);
    expect(user.validatePassword('wrongPassword')).toBe(false);
  });

  it('유효한 이름을 설정해야 한다', () => {
    const newName = 'newName';
    user.name = newName;
    expect(user.name).toBe(newName);
  });

  it('잘못된 이름을 설정할 때 에러를 발생시켜야 한다', () => {
    expect(() => {
      user.name = 'invalid_name!';
    }).toThrowError(
      '이름 형식이 올바르지 않습니다. 이름은 2-8자 길이여야 하며 한글, 영어, 숫자만 포함할 수 있습니다.',
    );
  });

  it('이메일을 업데이트하고 updatedAt을 설정해야 한다', () => {
    const newEmail = 'new@example.com';
    const oldUpdatedAt = user.updatedAt;
    user.email = newEmail;
    expect(user.email).toBe(newEmail);
    expect(user.updatedAt).not.toBe(oldUpdatedAt);
  });

  it('AggregateRoot의 validate 메서드가 구현되어 있지 않음을 확인해야 한다', () => {
    expect(() => {
      user.validate();
    }).toThrowError('아직 구현체 없음');
  });
});
