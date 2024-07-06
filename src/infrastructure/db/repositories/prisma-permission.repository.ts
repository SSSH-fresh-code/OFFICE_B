import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPermissionRepository } from '../../../domain/permission/infrastructure/permission.repository';
import { Permission } from '../../../domain/permission/domain/permission.entity';

@Injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({});

    return permissions.map(permission => Permission.of(permission));
  }

  async findByName(name: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUniqueOrThrow({
      where: { name }
    });

    return Permission.of(permission);
  }

  async createPermission(permission: Permission): Promise<Permission> {
    const createPermission = await this.prisma.permission.create({
      data: {
        name: permission.name,
        description: permission.description,
      },
    });

    return Permission.of(createPermission);
  }

  async updatePermission(permission: Permission): Promise<Permission> {
    const updatePermission = await this.prisma.permission.update({
      where: {
        name: permission.name
      },
      data: {
        description: permission.description,
      },
    });

    return Permission.of(updatePermission);
  }

  async deletePermission(name: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { name }
    })
  }

}
