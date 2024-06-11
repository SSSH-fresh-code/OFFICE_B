import { Injectable, Inject } from '@nestjs/common';
import { IPermissionRepository } from '../infrastructure/permission.repository';
import { Permission } from '../domain/permission.entity';
import { CreatePermissionDto } from '../presentation/dto/create-permission.dto';
import { UpdatePermissionDto } from '../presentation/dto/update-permission.dto';
import { PERMISSION_REPOSITORY } from '../permission.const';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: IPermissionRepository,
  ) { }

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, description } = createPermissionDto;
    const permission = new Permission(uuidv4(), name, description);
    return this.permissionRepository.save(permission);
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const { name, description } = updatePermissionDto;
    const permission = await this.permissionRepository.findById(id);
    permission.updateDetails(name, description);
    return this.permissionRepository.save(permission);
  }

  async getPermissions(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async getPermissionById(id: string): Promise<Permission> {
    return this.permissionRepository.findById(id);
  }

  async deletePermission(id: string): Promise<void> {
    await this.permissionRepository.remove(id);
  }
}