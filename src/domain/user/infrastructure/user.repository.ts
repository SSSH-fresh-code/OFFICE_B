import { User } from '../domain/entities/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
