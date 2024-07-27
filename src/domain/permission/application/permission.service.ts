import {Injectable, Inject, HttpStatus} from '@nestjs/common';
import {IPermissionRepository} from '../infrastructure/permission.repository';
import {Permission} from '../domain/permission.entity';
import {CreatePermissionDto} from '../presentation/dto/create-permission.dto';
import {UpdatePermissionDto} from '../presentation/dto/update-permission.dto';
import {PERMISSION_REPOSITORY} from '../permission.const';
import {ReadPermissionDto} from '../presentation/dto/read-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<ReadPermissionDto> {
    const {name, description} = createPermissionDto;

    const permission = new Permission(name, description);

    const createPermission =
      await this.permissionRepository.createPermission(permission);

    return createPermission.toDto();
  }

  async updatePermission(dto: UpdatePermissionDto): Promise<ReadPermissionDto> {
    const permission = await this.permissionRepository.findByName(dto.name);

    permission.updateDetails(dto.description);

    const updatePermission =
      await this.permissionRepository.updatePermission(permission);

    return updatePermission.toDto();
  }

  async getPermissions(): Promise<ReadPermissionDto[]> {
    const permissions = await this.permissionRepository.findAll();

    return permissions.map((p) => p.toDto());
  }

  async getPermissionByName(name: string): Promise<ReadPermissionDto> {
    const permission = await this.permissionRepository.findByName(name);

    return permission.toDto();
  }

  async deletePermission(name: string): Promise<void> {
    await this.permissionRepository.deletePermission(name);
  }
}
