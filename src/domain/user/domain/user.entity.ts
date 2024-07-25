import * as bcrypt from 'bcrypt';
import { iUser } from './user.interface';
import { ReadUserDto } from '../presentation/dto/read-user.dto';
import { User as PrismaUser } from "@prisma/client";

/**
 * UserEntity 클래스
 */
export class User implements iUser {

  constructor(
    private _id: string,
    private _email: string,
    private _password: string,
    private _name: string,
    private _permissions: string[] = [],
    private _createdAt?: Date,
    private _updatedAt?: Date,
  ) {
  }


  static of({ id, email, password, name, createdAt, updatedAt }: PrismaUser) {
    return new this(
      id,
      email,
      password,
      name,
      [],
      createdAt,
      updatedAt
    );
  }

  /**
   * ID getter
   * @returns string 사용자 ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * 이메일 getter
   * @returns string 이메일 주소
   */
  get email(): string {
    return this._email;
  }

  /**
   * 이메일 setter
   * @param email 설정할 이메일 주소
   */
  set email(email: string) {
    this._email = email;
    this._updatedAt = new Date();
  }

  /**
   * 이메일 getter
   * @returns string 이메일 주소
   */
  get password(): string {
    return this._password;
  }

  /**
   * 비밀번호를 기본값으로 재설정합니다.
   */
  resetPassword(): void {
    this._password = '12345678a';
    this.encryptPassword()
  }

  encryptPassword() {
    this._password = bcrypt.hashSync(this._password, 10);
  }

  /**
   * 비밀번호를 검증합니다.
   * @param password 검증할 비밀번호
   * @returns boolean 비밀번호가 일치하면 true, 아니면 false를 반환합니다.
   */
  validatePassword(password: string): boolean {
    return bcrypt.compareSync(password, this._password);
  }

  /**
   * 이름 getter
   * @returns string 사용자 이름
   */
  get name(): string {
    return this._name;
  }

  /**
   * 이름 setter
   * @param name 설정할 이름
   * @throws Error 이름 형식이 올바르지 않을 때 에러를 던집니다.
   */
  set name(name: string) {
    const nameRegex = /^[가-힣a-zA-Z0-9]{2,8}$/;
    if (!nameRegex.test(name)) {
      throw new Error(
        '이름 형식이 올바르지 않습니다. 이름은 2-8자 길이여야 하며 한글, 영어, 숫자만 포함할 수 있습니다.',
      );
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * 생성일 getter
   * @returns Date 생성일
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 수정일 getter
   * @returns Date 수정일
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }
  /**
     * 권한 할당 메서드
     * @param permissions 할당할 권한들
     */
  public assignPermissions(permissions: {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }[] | string[]): void {
    let _permissions = [];

    for (const p of permissions) {
      if (typeof p === "string") _permissions = permissions.map(n => n);
      else _permissions = permissions.map(n => n.name);

      break;
    }

    this._permissions = _permissions;
  }

  /**
   * 권한 getter
   * @returns Permission[] 사용자 권한들
   */
  public get permissions(): string[] {
    return this._permissions;
  }

  /**
   * 도메인 객체의 유효성을 검증합니다.
   * @throws Error 유효성 검증 실패 시 에러를 던집니다.
   */
  validate(): void {
    throw new Error('아직 구현체 없음');
  }

  toDto(): ReadUserDto {
    return {
      id: this._id,
      email: this.email,
      name: this._name,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }
}
