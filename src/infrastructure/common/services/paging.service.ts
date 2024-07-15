// src/infrastructure/services/paging.service.ts
import { PrismaService } from '../../db/prisma.service';
import { PagingDto } from '../dto/paging.dto';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { iPagingService } from './paging.interface';

export interface WhereClause {
  [key: string]: string;
}

export interface OrderByClause {
  [key: string]: Prisma.SortOrder;
}

export type Page<T> = { data: T[]; total: number };

/**
 * 공통 페이징 서비스 클래스
 * @template T Entity 타입
 */
@Injectable()
export class PagingService<T> implements iPagingService {
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
  ): Promise<Page<T>> {
    const { page, orderby, direction } = pagingDto;

    const take = Number(pagingDto.take);
    const skip = (page - 1) * take;
    const order = orderby ? { [orderby]: direction } : { id: 'desc' };
    const includes = {};

    where = this.parseWhereClause(where);

    // TODO: 추후 공통적으로 필히 수정
    if (model === "Series") {
      includes["topic"] = true;
    }


    const [data, total] = await this.prisma.$transaction([
      this.prisma[model].findMany({
        where,
        skip,
        take,
        orderBy: order,
        includes
      }),
      this.prisma[model].count({ where }),
    ]);

    return { data, total };
  }

  private parseWhereClause(where: WhereClause): WhereClause {
    const result = {};

    for (const key of Object.keys(where)) {
      const splitKey = key.split('__');

      if (splitKey.length !== 2) {
        continue;
      }

      switch (splitKey[0]) {
        case 'where':
          result[splitKey[1]] = where[key];
          break;
        case 'like':
          result[splitKey[1]] = {
            contains: where[key]
          }
          break;
        default:
          break;
      }
    }

    return result;
  }
}
