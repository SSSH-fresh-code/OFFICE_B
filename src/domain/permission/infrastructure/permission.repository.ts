import { Permission } from '../domain/permission.entity';

/**
 * IPermissionRepository 인터페이스
 */
export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findByName(name: string): Promise<Permission | null>;
  createPermission(permission: Permission): Promise<Permission>;
  updatePermission(permission: Permission): Promise<Permission>;
  deletePermission(name: string): Promise<void>;
}
