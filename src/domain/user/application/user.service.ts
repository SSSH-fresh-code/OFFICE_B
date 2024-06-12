import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { USER_REPOSITORY } from '../user.const';
import { PagingService } from '../../../infrastructure/services/paging.service';
import { User } from '../domain/user.entity';
import { ReadUserDto } from '../presentation/dto/read-user.dto';
import { UserPagingDto } from '../presentation/dto/user-paging.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly pagingService: PagingService<User>,
  ) { }

  async createUser(
    email: string,
    password: string,
    name: string,
    permissions: string[], // 추가된 권한 파라미터
  ): Promise<User> {
    const user = new User(uuidv4(), email, password, name, permissions);
    user.encryptPassword();

    return this.userRepository.save(user);
  }

  async updateUserName(updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findById(updateUserDto.id);
    user.name = updateUserDto.name;

    return this.userRepository.save(user);
  }

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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserByEmailForLogin(email: string): Promise<User | null> {
    let user = await this.userRepository.findByEmail(email);

    user = await this.userRepository.setPermissionByUser(user);

    return user;
  }

  serializeUser(user: User): string {
    return user.id;
  }

  async deserializeUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}