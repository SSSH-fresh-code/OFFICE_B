import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {UserRepository} from '../../../domain/user/infrastructure/user.repository';
import {User} from '../../../domain/user/domain/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({});
    return users.map(
      (user) =>
        new User(
          user.id,
          user.email,
          user.password,
          user.name,
          [],
          user.createdAt,
          user.updatedAt,
        ),
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {id},
      include: {permissions: true},
    });

    return new User(
      user.id,
      user.email,
      user.password,
      user.name,
      [],
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {email},
      include: {permissions: true},
    });
    return new User(
      user.id,
      user.email,
      user.password,
      user.name,
      [],
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {name},
      include: {permissions: true},
    });

    return new User(
      user.id,
      user.email,
      user.password,
      user.name,
      [],
      user.createdAt,
      user.updatedAt,
    );
  }

  async save(user: User): Promise<User> {
    const upsertUser = await this.prisma.user.upsert({
      include: {permissions: true},
      where: {id: user.id},
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

    return new User(
      upsertUser.id,
      upsertUser.email,
      upsertUser.password,
      upsertUser.name,
      [],
      upsertUser.createdAt,
      upsertUser.updatedAt,
    );
  }

  async getPermissionByUser(user: User): Promise<User> {
    const {permissions} = await this.prisma.user.findUniqueOrThrow({
      where: {id: user.id},
      select: {permissions: true},
    });

    user.assignPermissions(permissions);

    return user;
  }

  async setPermission(user: User): Promise<User> {
    const u = await this.prisma.user.update({
      where: {id: user.id},
      data: {
        permissions: {
          set: user.permissions.map((name) => ({name})),
        },
      },
      include: {
        permissions: true,
      },
    });

    const permissions = u.permissions.map((p) => p.name);

    return new User(
      u.id,
      u.email,
      u.password,
      u.name,
      permissions,
      u.createdAt,
      u.updatedAt,
    );
  }
}
