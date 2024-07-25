import { User } from '../domain/user.entity';

export interface UserRepository {
  /**
   * ID로 사용자를 조회합니다. 
   * 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {string} id - 조회할 사용자의 ID
   * @returns {Promise<User>} - 조회된 사용자 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   */
  findById(id: string): Promise<User | null>;
  /**
   * 이메일로 사용자를 조회합니다. 
   * 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {string} email - 조회할 사용자의 이메일
   * @returns {Promise<User>} - 조회된 사용자 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   */
  findByEmail(email: string): Promise<User | null>;
  /**
   * ID로 사용자를 조회합니다. 
   * 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {string} id - 조회할 사용자의 ID
   * @returns {Promise<User>} - 조회된 사용자 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   */
  findByName(id: string): Promise<User | null>;
  /**
   * 사용자를 저장합니다. 사용자가 존재하면 업데이트하고, 존재하지 않으면 새로 생성합니다.
   * 
   * @param {User} user - 저장할 사용자 정보
   * @returns {Promise<User>} - 저장된 사용자 정보를 반환합니다.
   */
  save(user: User): Promise<User>;

  /**
   * 사용자의 권한을 조회하고 권한을 가진 유저 엔티티를 반환합니다. 
   * 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {User} user - 권한을 설정할 사용자 정보
   * @returns {Promise<User>} - 권한이 설정된 사용자 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 사용자가 존재하지 않으면 오류를 반환합니다.
   */
  getPermissionByUser(user: User): Promise<User>;

  /**
   * 해당 유저의 권한을 업데이트 합니다.
   * @param user - 저장할 사용자 정보
   * @returns {Promise<User>} - 권한이 저장된 사용자 정보를 반환합니다.
   */
  setPermission(user: User): Promise<User>;
}
