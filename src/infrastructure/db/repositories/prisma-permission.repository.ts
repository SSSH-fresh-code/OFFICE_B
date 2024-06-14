import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPermissionRepository } from '../../../domain/permission/infrastructure/permission.repository';
import { Permission } from '../../../domain/permission/domain/permission.entity';

@Injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({});
    return permissions.map(permission => new Permission(
      permission.name,
      permission.description,
      permission.createdAt,
      permission.updatedAt,
    ));
  }

  async findByName(name: string): Promise<Permission | null> {
    try {
      const permission = await this.prisma.permission.findUniqueOrThrow({
        where: { name }
      });
      return new Permission(
        permission.name,
        permission.description,
        permission.createdAt,
        permission.updatedAt,
      );
    } catch (error) {
      throw new NotFoundException(`이름이 ${name}인 권한을 찾을 수 없습니다.`);
    }
  }

  async save(permission: Permission): Promise<Permission> {
    const upsertPermission = await this.prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
        updatedAt: new Date(),
      },
      create: {
        name: permission.name,
        description: permission.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return new Permission(
      upsertPermission.name,
      upsertPermission.description,
      upsertPermission.createdAt,
      upsertPermission.updatedAt,
    );
  }

  async remove(name: string): Promise<void> {
    try {
      await this.prisma.permission.delete({
        where: { name },
      });
    } catch (error) {
      throw new NotFoundException(`이름이 ${name}인 권한을 찾을 수 없습니다.`);
    }
  }

}