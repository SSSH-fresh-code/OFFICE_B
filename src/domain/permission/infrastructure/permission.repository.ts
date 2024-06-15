import { Permission } from '../domain/permission.entity';

/**
 * IPermissionRepository 인터페이스
 */
export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findByName(name: string): Promise<Permission | null>;
  save(permission: Permission): Promise<Permission>;
  remove(name: string): Promise<void>;
}