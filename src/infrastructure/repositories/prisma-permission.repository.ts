import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IPermissionRepository } from '../../domain/permission/infrastructure/permission.repository';
import { Permission } from '../../domain/permission/domain/permission.entity';

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
    try {
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
    } catch (error) {
      throw new NotFoundException(`ID가 ${id}인 권한을 찾을 수 없습니다.`);
    }
  }

  async findByName(name: string): Promise<Permission | null> {
    try {
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
    } catch (error) {
      throw new NotFoundException(`이름이 ${name}인 권한을 찾을 수 없습니다.`);
    }
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
    try {
      await this.prisma.permission.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`ID가 ${id}인 권한을 찾을 수 없습니다.`);
    }
  }
}