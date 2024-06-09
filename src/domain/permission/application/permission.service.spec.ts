import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { IPermissionRepository } from '../infrastructure/permission.repository';
import { CreatePermissionDto } from '../presentation/dto/create-permission.dto';
import { UpdatePermissionDto } from '../presentation/dto/update-permission.dto';
import { Permission } from '../domain/permission.entity';
import { PERMISSION_REPOSITORY } from '../permission.const';

const mockPermissionRepository = (): IPermissionRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('PermissionService', () => {
  let permissionService: PermissionService;
  let permissionRepository: jest.Mocked<IPermissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: PERMISSION_REPOSITORY,
          useFactory: mockPermissionRepository,
        },
      ],
    }).compile();

    permissionService = module.get<PermissionService>(PermissionService);
    permissionRepository = module.get<IPermissionRepository>(PERMISSION_REPOSITORY) as jest.Mocked<IPermissionRepository>;
  });

  describe('createPermission', () => {
    it('should create a permission successfully', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'create_user', description: 'Allows creating a new user' };
      const permission = new Permission('1', 'create_user', 'Allows creating a new user');
      permissionRepository.save.mockResolvedValue(permission);

      const result = await permissionService.createPermission(createPermissionDto);
      expect(result).toEqual(permission);
      expect(permissionRepository.save).toHaveBeenCalledWith(expect.any(Permission));
    });
  });

  describe('updatePermission', () => {
    it('should update a permission successfully', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'update_user', description: 'Allows updating a user' };
      const permission = new Permission('1', 'update_user', 'Allows updating a user');
      permissionRepository.save.mockResolvedValue(permission);
      permissionRepository.findById.mockResolvedValue(permission);

      const result = await permissionService.updatePermission('1', updatePermissionDto);
      expect(result).toEqual(permission);
      expect(permissionRepository.findById).toHaveBeenCalledWith('1');
      expect(permissionRepository.save).toHaveBeenCalledWith(expect.any(Permission));
    });
  });

  describe('getPermissions', () => {
    it('should return a list of permissions', async () => {
      const permissions = [
        new Permission('1', 'create_user', 'Allows creating a new user'),
        new Permission('2', 'update_user', 'Allows updating a user'),
      ];
      permissionRepository.findAll.mockResolvedValue(permissions);

      const result = await permissionService.getPermissions();
      expect(result).toEqual(permissions);
      expect(permissionRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getPermissionById', () => {
    it('should return a permission by id', async () => {
      const permission = new Permission('1', 'create_user', 'Allows creating a new user');
      permissionRepository.findById.mockResolvedValue(permission);

      const result = await permissionService.getPermissionById('1');
      expect(result).toEqual(permission);
      expect(permissionRepository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('deletePermission', () => {
    it('should remove a permission by id', async () => {
      permissionRepository.remove.mockResolvedValue();

      await permissionService.deletePermission('1');
      expect(permissionRepository.remove).toHaveBeenCalledWith('1');
    });
  });
});