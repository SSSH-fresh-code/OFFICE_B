import { User } from '../domain/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  setPermissionByUser(user: User): Promise<User>;
}
