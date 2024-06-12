import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaPermissionRepository } from './prisma-permission.repository';
import { Permission } from '../../domain/permission/domain/permission.entity';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('PrismaPermissionRepository', () => {
  let repository: PrismaPermissionRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        PrismaService,
        PrismaPermissionRepository,
        ConfigService,
      ],
    }).compile();

    repository = module.get<PrismaPermissionRepository>(PrismaPermissionRepository);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  });

  beforeEach(async () => {
    await prisma.permission.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('findAll', () => {
    it('모든 권한을 성공적으로 조회해야 합니다.', async () => {
      const permission1 = new Permission('create_user', '새 유저를 생성할 수 있습니다.');
      const permission2 = new Permission('update_user', '유저를 업데이트할 수 있습니다.');

      await repository.save(permission1);
      await repository.save(permission2);

      const result = await repository.findAll();
      expect(result.length).toBe(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'create_user' }),
          expect.objectContaining({ name: 'update_user' }),
        ]),
      );
    });

    it('권한이 없을 때 빈 배열을 반환해야 합니다.', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('이름으로 권한을 성공적으로 조회해야 합니다.', async () => {
      const permission = new Permission('create_user', '새 유저를 생성할 수 있습니다.');
      await repository.save(permission);

      const result = await repository.findByName(permission.name);
      expect(result).toEqual(expect.objectContaining({ name: permission.name }));
    });

    it('존재하지 않는 이름으로 조회 시 에러를 던져야 합니다.', async () => {
      const name = 'nonexistent_name';
      await expect(repository.findByName(name)).rejects.toThrow(`이름이 ${name}인 권한을 찾을 수 없습니다.`);
    });
  });

  describe('save', () => {
    it('권한을 성공적으로 저장해야 합니다.', async () => {
      const permission = new Permission('create_user', '새 유저를 생성할 수 있습니다.');
      const result = await repository.save(permission);
      expect(result).toEqual(expect.objectContaining({ name: permission.name }));
    });

    it('기존 권한을 업데이트해야 합니다.', async () => {
      const permission = new Permission('create_user', '새 유저를 생성할 수 있습니다.');
      await repository.save(permission);

      permission.updateDetails('유저를 업데이트할 수 있습니다.');
      const updatedPermission = await repository.save(permission);

      expect(updatedPermission.name).toBe('create_user');
      expect(updatedPermission.description).toBe('유저를 업데이트할 수 있습니다.');
    });
  });

  describe('remove', () => {
    it('ID로 권한을 성공적으로 삭제해야 합니다.', async () => {
      const permission = new Permission('create_user', '새 유저를 생성할 수 있습니다.');
      await repository.save(permission);

      await repository.remove(permission.name);
    });

    it('존재하지 않는 ID로 삭제 시 에러를 던져야 합니다.', async () => {
      const name = "00000001";
      await expect(async () => {
        await repository.remove(name);
      }).rejects.toThrow(new NotFoundException(`이름이 ${name}인 권한을 찾을 수 없습니다.`));
    });

  });
});