import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { IPermissionRepository } from '../infrastructure/permission.repository';
import { CreatePermissionDto } from '../presentation/dto/create-permission.dto';
import { UpdatePermissionDto } from '../presentation/dto/update-permission.dto';
import { Permission } from '../domain/permission.entity';
import { PERMISSION_REPOSITORY } from '../permission.const';

/**
 * Mock Permission Repository
 * 권한 저장소의 Mock 함수들을 정의합니다.
 */
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
    it('권한을 성공적으로 생성해야 합니다.', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'create_user', description: '새 유저를 생성할 수 있습니다.' };
      const permission = new Permission('1', 'create_user', '새 유저를 생성할 수 있습니다.');
      permissionRepository.save.mockResolvedValue(permission);

      const result = await permissionService.createPermission(createPermissionDto);
      expect(result).toEqual(permission);
      expect(permissionRepository.save).toHaveBeenCalledWith(expect.any(Permission));
    });

    it('중복된 권한 이름으로 생성 시 에러를 던져야 합니다.', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'create_user', description: '새 유저를 생성할 수 있습니다.' };
      permissionRepository.save.mockRejectedValue(new Error('이미 존재하는 권한입니다.'));

      await expect(permissionService.createPermission(createPermissionDto)).rejects.toThrow('이미 존재하는 권한입니다.');
    });
  });

  describe('updatePermission', () => {
    it('권한을 성공적으로 업데이트해야 합니다.', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'update_user', description: '유저를 업데이트할 수 있습니다.' };
      const permission = new Permission('1', 'create_user', '새 유저를 생성할 수 있습니다.');
      permissionRepository.findById.mockResolvedValue(permission);
      permissionRepository.save.mockResolvedValue(permission);

      const result = await permissionService.updatePermission('1', updatePermissionDto);
      expect(result).toEqual(permission);
      expect(permissionRepository.findById).toHaveBeenCalledWith('1');
      expect(permissionRepository.save).toHaveBeenCalledWith(expect.any(Permission));
    });

    it('존재하지 않는 권한을 업데이트 시 에러를 던져야 합니다.', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'update_user', description: '유저를 업데이트할 수 있습니다.' };
      permissionRepository.findById.mockRejectedValue(new Error('ID가 1인 권한을 찾을 수 없습니다.'));

      await expect(permissionService.updatePermission('1', updatePermissionDto)).rejects.toThrow('ID가 1인 권한을 찾을 수 없습니다.');
    });
  });

  describe('getPermissions', () => {
    it('권한 목록을 성공적으로 반환해야 합니다.', async () => {
      const permissions = [
        new Permission('1', 'create_user', '새 유저를 생성할 수 있습니다.'),
        new Permission('2', 'update_user', '유저를 업데이트할 수 있습니다.'),
      ];
      permissionRepository.findAll.mockResolvedValue(permissions);

      const result = await permissionService.getPermissions();
      expect(result).toEqual(permissions);
      expect(permissionRepository.findAll).toHaveBeenCalled();
    });

    it('권한이 없을 때 빈 배열을 반환해야 합니다.', async () => {
      permissionRepository.findAll.mockResolvedValue([]);

      const result = await permissionService.getPermissions();
      expect(result).toEqual([]);
      expect(permissionRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getPermissionById', () => {
    it('ID로 권한을 성공적으로 조회해야 합니다.', async () => {
      const permission = new Permission('1', 'create_user', '새 유저를 생성할 수 있습니다.');
      permissionRepository.findById.mockResolvedValue(permission);

      const result = await permissionService.getPermissionById('1');
      expect(result).toEqual(permission);
      expect(permissionRepository.findById).toHaveBeenCalledWith('1');
    });

    it('존재하지 않는 ID로 조회 시 에러를 던져야 합니다.', async () => {
      permissionRepository.findById.mockRejectedValue(new Error('ID가 1인 권한을 찾을 수 없습니다.'));

      await expect(permissionService.getPermissionById('1')).rejects.toThrow('ID가 1인 권한을 찾을 수 없습니다.');
    });
  });

  describe('deletePermission', () => {
    it('ID로 권한을 삭제해야 합니다.', async () => {
      permissionRepository.remove.mockResolvedValue();

      await permissionService.deletePermission('1');
      expect(permissionRepository.remove).toHaveBeenCalledWith('1');
    });

    it('존재하지 않는 ID로 삭제 시 에러를 던져야 합니다.', async () => {
      permissionRepository.remove.mockRejectedValue(new Error('ID가 1인 권한을 찾을 수 없습니다.'));

      await expect(permissionService.deletePermission('1')).rejects.toThrow('ID가 1인 권한을 찾을 수 없습니다.');
    });
  });
});