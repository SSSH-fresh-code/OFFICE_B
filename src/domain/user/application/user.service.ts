import { Injectable, Inject } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { UserRepository } from '../infrastructure/user.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) { }

  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<User> {
    const user = new User(uuidv4, email, password, name);
    return this.userRepository.save(user);
  }

  async updateUser(id: string, name: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.name = name;
    return this.userRepository.save(user);
  }
}
