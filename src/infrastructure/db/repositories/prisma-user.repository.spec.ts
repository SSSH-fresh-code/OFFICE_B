import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';
import { User } from '../../../domain/user/domain/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        PrismaService,
        PrismaUserRepository,
        ConfigService,
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['Permission', 'User']);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('findAll', () => {
    it('유저 목록을 성공적으로 반환해야 합니다.', async () => {
      const user1 = new User(uuidv4(), 'test1@example.com', 'password123', 'TestUser1');
      const user2 = new User(uuidv4(), 'test2@example.com', 'password123', 'TestUser2');
      await repository.save(user1);
      await repository.save(user2);

      const users = await repository.findAll();
      expect(users.length).toBe(2);
      expect(users).toEqual(expect.arrayContaining([expect.objectContaining({ email: 'test1@example.com' }), expect.objectContaining({ email: 'test2@example.com' })]));
    });

    it('빈 목록을 반환해야 합니다.', async () => {
      const users = await repository.findAll();
      expect(users.length).toBe(0);
    });
  });

  describe('findById', () => {
    it('유저를 성공적으로 찾을 수 있어야 합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      await repository.save(user);
      const foundUser = await repository.findById(user.id);
      expect(foundUser).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'TestUser',
      }));
    });

    it('유저를 찾을 수 없으면 예외를 던져야 합니다.', async () => {
      await expect(repository.findById(uuidv4())).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findByName', () => {
    it('유저를 성공적으로 찾을 수 있어야 합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      await repository.save(user);

      const foundUser = await repository.findByName(user.name);
      expect(foundUser).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'TestUser',
      }));
    });

    it('유저를 찾을 수 없으면 예외를 던져야 합니다.', async () => {
      await expect(repository.findById(uuidv4())).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findByEmail', () => {
    it('유저를 성공적으로 찾을 수 있어야 합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      await repository.save(user);
      const foundUser = await repository.findByEmail(user.email);
      expect(foundUser).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'TestUser',
      }));
    });

    it('유저를 찾을 수 없으면 예외를 던져야 합니다.', async () => {
      await expect(repository.findByEmail('nonexistent@example.com')).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('save', () => {
    it('유저를 성공적으로 생성해야 합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      const savedUser = await repository.save(user);
      expect(savedUser).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'TestUser',
      }));
    });

    it('유저를 성공적으로 업데이트해야 합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      const savedUser = await repository.save(user);
      savedUser.name = 'Updated';
      const updatedUser = await repository.save(savedUser);
      expect(updatedUser.name).toBe('Updated');
    });
  });

  describe('getPermissionByUser', () => {
    it('해당 유저의 권한을 가져와야 합니다.', async () => {
      const permissionName = "LOGIN001";

      await prisma.permission.create({
        data: {
          name: permissionName,
          description: "로그인 권한"
        },
      });

      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');

      const savedUser = await repository.save(user);

      await prisma.user.update({
        where: { id: savedUser.id },
        data: {
          permissions: {
            set: {
              name: permissionName
            }
          }
        },
      });

      const hasPermissionUser = await repository.getPermissionByUser(savedUser);

      expect(hasPermissionUser).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'TestUser',
      }));
      expect(hasPermissionUser.permissions).toEqual([permissionName]);
    });

    it('해당 유저의 권한이 없다면 빈 배열을 가진 유저를 반환합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser', []);

      const savedUser = await repository.save(user);

      const hasPermissionUser = await repository.getPermissionByUser(savedUser);

      expect(hasPermissionUser).toEqual(expect.objectContaining({
        email: 'test@example.com',
        name: 'TestUser',
      }));
      expect(hasPermissionUser.permissions).toEqual([]);
    });

    it('해당 유저가 없다면 에러를 반환합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser', ["LOGIN001"]);

      await expect(async () => {
        await repository.getPermissionByUser(user);
      }).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('setPermission', () => {
    it('권한이 없는 유저의 경우 권한을 그대로 추가합니다.', async () => {
      const testPermission1 = "TEST0001";
      const testPermission2 = "TEST0002";

      await prisma.permission.createMany({
        data: [testPermission1, testPermission2].map((p, idx) => ({
          name: p, description: `${idx}`
        })),
      });

      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      const savedUser = await repository.save(user);

      savedUser.assignPermissions([testPermission1, testPermission2])

      const setPermissionUser = await repository.setPermission(savedUser);

      expect(user.permissions).toEqual([]);
      expect(savedUser.permissions).toEqual(setPermissionUser.permissions);
    })

    it('권한이 있는 유저의 경우 기존의 권한을 삭제 후 추가합니다.', async () => {
      const testPermission1 = "TEST0001";
      const testPermission2 = "TEST0002";

      await prisma.permission.createMany({
        data: [testPermission1, testPermission2].map((p, idx) => ({
          name: p, description: `${idx}`
        })),
      });

      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      const savedUser = await repository.save(user);

      savedUser.assignPermissions([testPermission1])

      const setPermissionUser = await repository.setPermission(savedUser);

      savedUser.assignPermissions([testPermission2]);

      const setPermissionUser2 = await repository.setPermission(savedUser);

      expect(setPermissionUser.permissions).toEqual([testPermission1]);
      expect(setPermissionUser2.permissions).toEqual([testPermission2]);
    })

    it('권한이 있는 유저에 빈 배열이 들어온 경우 초기화 합니다.', async () => {
      const permissionName = "LOGIN001";

      await prisma.permission.create({
        data: {
          name: permissionName,
          description: "로그인 권한"
        },
      });

      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      const savedUser = await repository.save(user);

      savedUser.assignPermissions([permissionName]);

      const setPermissionUser = await repository.setPermission(savedUser);

      savedUser.assignPermissions([]);

      const setPermissionUser2 = await repository.setPermission(savedUser);

      expect(setPermissionUser.permissions).toEqual([permissionName]);
      expect(setPermissionUser2.permissions).toEqual([]);
    })

    it('유저가 없는 경우 에러를 반환합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');

      await expect(async () => {
        await repository.setPermission(user);
      }).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    })

    it('존재하지 않는 권한인 경우 에러를 반환합니다.', async () => {
      const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
      const savedUser = await repository.save(user);

      savedUser.assignPermissions(["fakePermission"]);

      await expect(async () => {
        await repository.setPermission(savedUser);
      }).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    })
  });
});
