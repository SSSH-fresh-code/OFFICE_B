import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from 'src/domain/user/infrastructure/user.repository';
import { User } from 'src/domain/user/domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return users.map(user => new User(user.id, user.email, "", user.name, user.createdAt, user.updatedAt));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id }
    });
    if (!user) return null;
    return new User(user.id, user.email, "", user.name, user.createdAt, user.updatedAt);
  }

  async save(user: User): Promise<User> {
    const upsertUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        password: user.password,
        name: user.name,
        updatedAt: new Date(),
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
    return new User(upsertUser.id, upsertUser.email, upsertUser.password, upsertUser.name, upsertUser.createdAt, upsertUser.updatedAt);
  }
}