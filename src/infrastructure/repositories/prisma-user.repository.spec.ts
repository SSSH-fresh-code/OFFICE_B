import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/user/domain/user.entity';

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
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('유저를 성공적으로 생성해야 합니다.', async () => {
    const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
    const savedUser = await repository.save(user);
    expect(savedUser).toEqual(expect.objectContaining({
      email: 'test@example.com',
      name: 'TestUser',
    }));
  });

  it('유저를 성공적으로 찾을 수 있어야 합니다.', async () => {
    const user = new User(uuidv4(), 'test@example.com', 'password123', 'TestUser');
    await repository.save(user);
    const foundUser = await repository.findById(user.id);
    expect(foundUser).toEqual(expect.objectContaining({
      email: 'test@example.com',
      name: 'TestUser',
    }));
  });

  it('유저 목록을 성공적으로 반환해야 합니다.', async () => {
    const user1 = new User(uuidv4(), 'test1@example.com', 'password123', 'TestUser1');
    const user2 = new User(uuidv4(), 'test2@example.com', 'password123', 'TestUser2');
    await repository.save(user1);
    await repository.save(user2);

    const users = await repository.findAll();
    expect(users.length).toBe(2);
  });
});