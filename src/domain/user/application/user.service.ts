import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { USER_REPOSITORY } from '../user.const';
import { PagingService } from '../../../infrastructure/services/paging.service'; // 상대 경로로 수정
import { UserPagingDto } from '../presentation/dto/user-paging.dto';
import { User } from '../domain/user.entity';
import { ReadUserDto } from '../presentation/dto/read-user.dto';

/**
 * 유저 서비스 클래스
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly pagingService: PagingService<User>,
  ) { }

  /**
   * 유저를 생성합니다.
   * @param email 이메일
   * @param password 비밀번호
   * @param name 이름
   * @returns 생성된 유저
   */
  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<User> {
    const user = new User(uuidv4(), email, password, name);
    return this.userRepository.save(user);
  }

  /**
   * 유저 정보를 수정합니다.
   * @param id 유저 ID
   * @param name 이름
   * @returns 수정된 유저 또는 null
   */
  async updateUser(id: string, name: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.name = name;
    return this.userRepository.save(user);
  }

  /**
   * 유저 목록을 조회합니다.
   * @param pagingDto 페이징 DTO
   * @returns 유저 목록과 총 개수
   */
  async getUsers(pagingDto: UserPagingDto): Promise<{ data: User[]; total: number }> {
    const where = {};
    if (pagingDto.where__email) {
      where['email'] = pagingDto.where__email;
    }
    if (pagingDto.like__name) {
      where['name'] = { contains: pagingDto.like__name };
    }
    const orderBy = {};
    if (pagingDto.orderby) {
      orderBy[pagingDto.orderby] = pagingDto.direction;
    }

    return this.pagingService.getPagedResults('User', pagingDto, where, orderBy);
  }

  async getUserById(id: string): Promise<ReadUserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}