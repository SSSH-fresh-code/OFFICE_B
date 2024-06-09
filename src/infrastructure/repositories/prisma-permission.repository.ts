import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IPermissionRepository } from 'src/domain/permission/infrastructure/permission.repository';
import { Permission } from 'src/domain/permission/domain/permission.entity';

@Injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({});
    return permissions.map(permission => new Permission(
      permission.id,
      permission.name,
      permission.description,
      permission.createdAt,
      permission.updatedAt,
    ));
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUniqueOrThrow({
      where: { id }
    });
    return new Permission(
      permission.id,
      permission.name,
      permission.description,
      permission.createdAt,
      permission.updatedAt,
    );
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUniqueOrThrow({
      where: { name }
    });
    return new Permission(
      permission.id,
      permission.name,
      permission.description,
      permission.createdAt,
      permission.updatedAt,
    );
  }

  async save(permission: Permission): Promise<Permission> {
    const upsertPermission = await this.prisma.permission.upsert({
      where: { id: permission.id },
      update: {
        name: permission.name,
        description: permission.description,
        updatedAt: new Date(),
      },
      create: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return new Permission(
      upsertPermission.id,
      upsertPermission.name,
      upsertPermission.description,
      upsertPermission.createdAt,
      upsertPermission.updatedAt,
    );
  }

  async remove(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }
}