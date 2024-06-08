import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User('1', 'test@example.com', 'password123', 'TestUser');
  });

  describe('constructor', () => {
    it('유저 엔티티를 성공적으로 생성해야 합니다.', () => {
      expect(user.id).toEqual('1');
      expect(user.email).toEqual('test@example.com');
      expect(user.password).toEqual('password123');
      expect(user.name).toEqual('TestUser');
    });
  });

  describe('email getter and setter', () => {
    it('이메일을 성공적으로 가져와야 합니다.', () => {
      expect(user.email).toEqual('test@example.com');
    });

    it('이메일을 성공적으로 설정해야 합니다.', () => {
      user.email = 'new@example.com';
      expect(user.email).toEqual('new@example.com');
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('password getter', () => {
    it('비밀번호를 성공적으로 가져와야 합니다.', () => {
      expect(user.password).toEqual('password123');
    });
  });

  describe('resetPassword', () => {
    it('비밀번호를 기본값으로 성공적으로 재설정해야 합니다.', () => {
      user.resetPassword();
      expect(user.validatePassword('12345678a')).toBe(true);
    });
  });

  describe('encryptPassword', () => {
    it('비밀번호를 성공적으로 암호화해야 합니다.', () => {
      user.encryptPassword();
      expect(bcrypt.compareSync('password123', user.password)).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('비밀번호가 일치하면 true를 반환해야 합니다.', () => {
      user.encryptPassword();
      expect(user.validatePassword('password123')).toBe(true);
    });

    it('비밀번호가 일치하지 않으면 false를 반환해야 합니다.', () => {
      user.encryptPassword();
      expect(user.validatePassword('wrongpassword')).toBe(false);
    });
  });

  describe('name getter and setter', () => {
    it('이름을 성공적으로 가져와야 합니다.', () => {
      expect(user.name).toEqual('TestUser');
    });

    it('이름을 성공적으로 설정해야 합니다.', () => {
      user.name = 'NewName';
      expect(user.name).toEqual('NewName');
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('이름 형식이 올바르지 않으면 에러를 던져야 합니다.', () => {
      expect(() => {
        user.name = 'Invalid Name!';
      }).toThrow(
        '이름 형식이 올바르지 않습니다. 이름은 2-8자 길이여야 하며 한글, 영어, 숫자만 포함할 수 있습니다.',
      );
    });
  });

  describe('createdAt getter', () => {
    it('생성일을 성공적으로 가져와야 합니다.', () => {
      const createdAt = new Date();
      user = new User('1', 'test@example.com', 'password123', 'TestUser', createdAt);
      expect(user.createdAt).toEqual(createdAt);
    });
  });

  describe('updatedAt getter', () => {
    it('수정일을 성공적으로 가져와야 합니다.', () => {
      const updatedAt = new Date();
      user = new User('1', 'test@example.com', 'password123', 'TestUser', new Date(), updatedAt);
      expect(user.updatedAt).toEqual(updatedAt);
    });
  });

  describe('validate', () => {
    it('유효성 검증 실패 시 에러를 던져야 합니다.', () => {
      expect(() => {
        user.validate();
      }).toThrow('아직 구현체 없음');
    });
  });
});