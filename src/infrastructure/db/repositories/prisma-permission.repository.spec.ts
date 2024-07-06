import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { PrismaPermissionRepository } from './prisma-permission.repository';
import { Permission } from '../../../domain/permission/domain/permission.entity';
import { CreatePermissionDto } from 'src/domain/permission/presentation/dto/create-permission.dto';
import { Prisma } from '@prisma/client';

describe('PrismaPermissionRepository', () => {
  let repository: PrismaPermissionRepository;
  let prisma: PrismaService;

  const createDto: CreatePermissionDto = {
    name: "TEST0001",
    description: "테스트 권한입니다."
  }

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
    await prisma.cleanDatabase(['Permission']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('findAll', () => {
    it('모든 권한을 성공적으로 조회해야 합니다.', async () => {
      const createDto2 = { ...createDto, name: "TEST0002" };

      await prisma.permission.create({ data: createDto });
      await prisma.permission.create({ data: createDto2 });

      const result = await repository.findAll();

      expect(result.length).toBe(2);
      result.forEach(e => {
        expect([createDto.name, createDto2.name].includes(e.name)).toBeTruthy
      });
    });

    it('권한이 없을 때 빈 배열을 반환해야 합니다.', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('이름으로 권한을 성공적으로 조회해야 합니다.', async () => {
      await prisma.permission.create({ data: createDto });

      const result = await repository.findByName(createDto.name);

      expect(result.name).toEqual(createDto.name);
      expect(result.description).toEqual(createDto.description);
    });

    it('존재하지 않는 이름으로 조회 시 에러를 던져야 합니다.', async () => {
      await expect(repository.findByName("WRONG001")).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('createdPermission', () => {
    it('권한을 성공적으로 저장해야 합니다.', async () => {
      const permission = new Permission(createDto.name, createDto.description);

      const result = await repository.createPermission(permission);

      expect(result.name).toEqual(permission.name);
      expect(result.description).toEqual(permission.description);
    });

    it('이미 존재하는 이름인 경우 저장되지 않습니다.', async () => {
      await prisma.permission.create({ data: createDto });

      const permission = new Permission(createDto.name, createDto.description);

      await expect(repository.createPermission(permission)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('updatePermission', () => {
    it('권한을 성공적으로 수정해야 합니다.', async () => {
      const updateDetail = "업데이트 합니다.";
      const permission = await prisma.permission.create({ data: createDto });

      const updatedPermission = Permission.of(permission);
      updatedPermission.updateDetails(updateDetail);

      const result = await repository.updatePermission(updatedPermission);

      expect(result.name).toEqual(updatedPermission.name);
      expect(result.description).toEqual(updatedPermission.description);
    });

  });

  describe('deletePermission', () => {
    it('NAME으로 권한을 성공적으로 삭제해야 합니다.', async () => {
      const permission = await prisma.permission.create({ data: createDto });

      await repository.deletePermission(permission.name);
    });

    it('존재하지 않는 ID로 삭제 시 에러를 던져야 합니다.', async () => {
      const name = "00000001";

      await expect(repository.deletePermission(name)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });
});
