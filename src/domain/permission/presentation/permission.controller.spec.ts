import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ReadPermissionDto } from './dto/read-permission.dto';
import { Permission } from '../domain/permission.entity';
import { v4 as uuidv4 } from 'uuid';
import { PermissionService } from '../\bapplication/permission.service';

/**
 * Mock Permission Service
 * 권한 서비스의 Mock 함수들을 정의합니다.
 */
const mockPermissionService = () => ({
  createPermission: jest.fn(),
  updatePermission: jest.fn(),
  getPermissions: jest.fn(),
  getPermissionById: jest.fn(),
  deletePermission: jest.fn(),
});

describe('PermissionController', () => {
  let permissionController: PermissionController;
  let permissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useFactory: mockPermissionService,
        },
      ],
    }).compile();

    permissionController = module.get<PermissionController>(PermissionController);
    permissionService = module.get<PermissionService>(PermissionService);
  });

  describe('createPermission', () => {
    it('권한을 성공적으로 생성해야 합니다.', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'create_user', description: '새 유저를 생성할 수 있습니다.' };
      const permission = new Permission(uuidv4(), 'create_user', '새 유저를 생성할 수 있습니다.');
      permissionService.createPermission.mockResolvedValue(permission);

      const result = await permissionController.createPermission(createPermissionDto);
      expect(result).toEqual(new ReadPermissionDto(permission));
      expect(permissionService.createPermission).toHaveBeenCalledWith(createPermissionDto);
    });

    it('잘못된 요청으로 인해 권한 생성에 실패해야 합니다.', async () => {
      const createPermissionDto: CreatePermissionDto = { name: '', description: '설명 없음' };
      permissionService.createPermission.mockRejectedValue(new Error('잘못된 요청'));

      await expect(permissionController.createPermission(createPermissionDto)).rejects.toThrow('잘못된 요청');
    });
  });

  describe('updatePermission', () => {
    it('권한을 성공적으로 수정해야 합니다.', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'update_user', description: '유저를 업데이트할 수 있습니다.' };
      const permission = new Permission(uuidv4(), 'update_user', '유저를 업데이트할 수 있습니다.');
      permissionService.updatePermission.mockResolvedValue(permission);

      const result = await permissionController.updatePermission('1', updatePermissionDto);
      expect(result).toEqual(new ReadPermissionDto(permission));
      expect(permissionService.updatePermission).toHaveBeenCalledWith('1', updatePermissionDto);
    });

    it('존재하지 않는 권한 ID로 수정 시 에러를 던져야 합니다.', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'update_user', description: '유저를 업데이트할 수 있습니다.' };
      permissionService.updatePermission.mockRejectedValue(new Error('권한을 찾을 수 없습니다.'));

      await expect(permissionController.updatePermission('1', updatePermissionDto)).rejects.toThrow('권한을 찾을 수 없습니다.');
    });
  });

  describe('getPermissions', () => {
    it('모든 권한을 성공적으로 조회해야 합니다.', async () => {
      const permissions = [
        new Permission(uuidv4(), 'create_user', '새 유저를 생성할 수 있습니다.'),
        new Permission(uuidv4(), 'update_user', '유저를 업데이트할 수 있습니다.'),
      ];
      permissionService.getPermissions.mockResolvedValue(permissions);

      const result = await permissionController.getPermissions();
      expect(result).toEqual(permissions.map(permission => new ReadPermissionDto(permission)));
      expect(permissionService.getPermissions).toHaveBeenCalled();
    });
  });

  describe('getPermissionById', () => {
    it('ID로 권한을 성공적으로 조회해야 합니다.', async () => {
      const permission = new Permission(uuidv4(), 'create_user', '새 유저를 생성할 수 있습니다.');
      permissionService.getPermissionById.mockResolvedValue(permission);

      const result = await permissionController.getPermissionById('1');
      expect(result).toEqual(new ReadPermissionDto(permission));
      expect(permissionService.getPermissionById).toHaveBeenCalledWith('1');
    });

    it('존재하지 않는 권한 ID로 조회 시 에러를 던져야 합니다.', async () => {
      permissionService.getPermissionById.mockRejectedValue(new Error('권한을 찾을 수 없습니다.'));

      await expect(permissionController.getPermissionById('1')).rejects.toThrow('권한을 찾을 수 없습니다.');
    });
  });

  describe('removePermission', () => {
    it('ID로 권한을 성공적으로 삭제해야 합니다.', async () => {
      permissionService.deletePermission.mockResolvedValue();

      await permissionController.removePermission('1');
      expect(permissionService.deletePermission).toHaveBeenCalledWith('1');
    });

    it('존재하지 않는 권한 ID로 삭제 시 에러를 던져야 합니다.', async () => {
      permissionService.deletePermission.mockRejectedValue(new Error('권한을 찾을 수 없습니다.'));

      await expect(permissionController.removePermission('1')).rejects.toThrow('권한을 찾을 수 없습니다.');
    });
  });
});