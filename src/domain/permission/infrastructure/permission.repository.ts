import { Permission } from '../domain/permission.entity';

/**
 * IPermissionRepository 인터페이스
 */
export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  save(permission: Permission): Promise<Permission>;
  remove(id: string): Promise<void>;
}