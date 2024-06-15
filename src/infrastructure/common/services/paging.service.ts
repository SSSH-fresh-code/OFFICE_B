// src/infrastructure/services/paging.service.ts
import { PrismaService } from '../../db/prisma.service';
import { PagingDto } from '../dto/paging.dto';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

interface WhereClause {
  [key: string]: any;
}

interface OrderByClause {
  [key: string]: Prisma.SortOrder;
}

/**
 * 공통 페이징 서비스 클래스
 * @template T Entity 타입
 */
@Injectable()
export class PagingService<T> {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 페이징 결과를 가져옵니다.
   * @param model Prisma 모델 이름
   * @param pagingDto 페이징 DTO
   * @param where 조건절
   * @param orderBy 정렬 조건
   * @returns 데이터와 총 개수를 포함한 객체
   */
  async getPagedResults(
    model: Prisma.ModelName,
    pagingDto: PagingDto,
    where: WhereClause = {},
    orderBy: OrderByClause = {}
  ): Promise<{ data: T[]; total: number }> {
    const { page, orderby, direction } = pagingDto;

    const take = Number(pagingDto.take);
    const skip = (page - 1) * take;
    const order = orderby ? { [orderby]: direction } : { id: 'desc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma[model].findMany({
        where,
        skip,
        take,
        orderBy: order,
      }),
      this.prisma[model].count({ where }),
    ]);

    return { data, total };
  }
}