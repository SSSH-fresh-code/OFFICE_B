import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';
import { User } from '../../domain/user/domain/user.entity';
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
    await prisma.cleanDatabase(['UserPermission', 'User']);
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

  // describe('setPermissionByUser', () => {
  //   it('해당 user의 permission을 가져와야 합니다.', async () => {
  //     const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser', []);
  //     const savedUser = await repository.save(user);
  //     expect(savedUser).toEqual(expect.objectContaining({
  //       email: 'test@example.com',
  //       name: 'TestUser',
  //     }));
  //   });

  //   it('유저를 성공적으로 업데이트해야 합니다.', async () => {
  //     const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
  //     const savedUser = await repository.save(user);
  //     savedUser.name = 'Updated';
  //     const updatedUser = await repository.save(savedUser);
  //     expect(updatedUser.name).toBe('Updated');
  //   });
  // });
});