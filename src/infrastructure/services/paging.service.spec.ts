import { Test, TestingModule } from '@nestjs/testing';
import { PagingService } from './paging.service';
import { PrismaService } from '../prisma/prisma.service';
import { PagingDto } from '../dto/paging.dto';
import { User } from '@prisma/client';

// Mock PrismaService
const mockPrismaService = () => ({
  'User': {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((promises) => Promise.all(promises)),
});

describe('PagingService', () => {
  let pagingService: PagingService<User>;
  let prismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagingService,
        { provide: PrismaService, useFactory: mockPrismaService },
      ],
    }).compile();

    pagingService = module.get<PagingService<User>>(PagingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getPagedResults', () => {
    it('페이징된 결과를 성공적으로 반환해야 합니다.', async () => {
      const pagingDto: PagingDto = { page: 1, take: 10 };
      const users = [{ id: '1', email: 'test1@example.com', name: 'TestUser1' }];
      const total = 1;

      prismaService.$transaction.mockResolvedValue([users, total]);

      const result = await pagingService.getPagedResults('User', pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService['User'].findMany({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { id: 'DESC' },
        }),
        prismaService['User'].count({ where: {} }),
      ]);
    });

    it('where 조건을 적용하여 페이징된 결과를 반환해야 합니다.', async () => {
      const pagingDto: PagingDto = { page: 1, take: 10 };
      const users = [{ id: '1', email: 'test1@example.com', name: 'TestUser1' }];
      const total = 1;
      const where = { email: 'test1@example.com' };

      prismaService.$transaction.mockResolvedValue([users, total]);

      const result = await pagingService.getPagedResults('User', pagingDto, where);
      expect(result).toEqual({ data: users, total });
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService['User'].findMany({
          where,
          skip: 0,
          take: 10,
          orderBy: { id: 'DESC' },
        }),
        prismaService['User'].count({ where }),
      ]);
    });

    it('orderBy 조건을 적용하여 페이징된 결과를 반환해야 합니다.', async () => {
      const pagingDto: PagingDto = { page: 1, take: 10, orderby: 'email', direction: 'ASC' };
      const users = [{ id: '1', email: 'test1@example.com', name: 'TestUser1' }];
      const total = 1;

      prismaService.$transaction.mockResolvedValue([users, total]);

      const result = await pagingService.getPagedResults('User', pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService['User'].findMany({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { email: 'ASC' },
        }),
        prismaService['User'].count({ where: {} }),
      ]);
    });

    it('페이지와 갯수를 적용하여 페이징된 결과를 반환해야 합니다.', async () => {
      const pagingDto: PagingDto = { page: 2, take: 5 };
      const users = [{ id: '6', email: 'test6@example.com', name: 'TestUser6' }];
      const total = 10;

      prismaService.$transaction.mockResolvedValue([users, total]);

      const result = await pagingService.getPagedResults('User', pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService['User'].findMany({
          where: {},
          skip: 5,
          take: 5,
          orderBy: { id: 'DESC' },
        }),
        prismaService['User'].count({ where: {} }),
      ]);
    });

    it('빈 결과를 반환해야 합니다.', async () => {
      const pagingDto: PagingDto = { page: 1, take: 10 };
      const users = [];
      const total = 0;

      prismaService.$transaction.mockResolvedValue([users, total]);

      const result = await pagingService.getPagedResults('User', pagingDto);
      expect(result).toEqual({ data: users, total });
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService['User'].findMany({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { id: 'DESC' },
        }),
        prismaService['User'].count({ where: {} }),
      ]);
    });
  });
});