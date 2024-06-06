import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { USER_REPOSITORY } from '../user.const';
import { PagingService } from 'src/infrastructure/services/paging.service';
import { User } from '../domain/user.entity';
import { ReadUserDto } from '../presentation/dto/read-user.dto';
import { UserPagingDto } from '../presentation/dto/user-paging.dto';
import { v4 as uuidv4 } from 'uuid';

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
  ): Promise<User> {
    const user = new User(uuidv4(), email, password, name);
    return this.userRepository.save(user);
  }

  async updateUser(id: string, name: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    user.name = name;
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
}