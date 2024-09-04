// src/infrastructure/services/paging.service.ts
import {PrismaService} from '../../db/prisma.service';
import {PagingDto} from '../dto/paging.dto';
import {Prisma} from '@prisma/client';
import {Injectable} from '@nestjs/common';
import {iPagingService} from './paging.interface';

export interface WhereClause {
  [key: string]: string;
}

export interface OrderByClause {
  [key: string]: Prisma.SortOrder;
}

export type PageInfo = {
  current: number;
  last: number;
  total: number;
  take: number;
};
export type Page<T> = {data: T[]; info: PageInfo};

/**
 * 공통 페이징 서비스 클래스
 * @template T Entity 타입
 */
@Injectable()
export class PagingService<T> implements iPagingService {
  constructor(private readonly prisma: PrismaService) {}

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
    where?: WhereClause,
  ): Promise<Page<T>> {
    const {page, orderby, direction} = pagingDto;

    const take = Number(pagingDto.take);
    const skip = (page - 1) * take;
    const order = orderby ? {[orderby]: direction} : {id: 'desc'};
    const include = {};

    where = this.parseWhereClause(pagingDto, where);

    if (model === 'Series') {
      include['topic'] = true;
    } else if (model === 'Post') {
      include['author'] = true;
      include['topic'] = true;
      include['series'] = true;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma[model].findMany({
        where,
        skip,
        take,
        orderBy: order,
        include,
      }),
      this.prisma[model].count({where}),
    ]);

    return {
      data: data,
      info: {
        take,
        current: +page,
        last:
          total % take !== 0
            ? Math.floor(total / take) + 1
            : Math.floor(total / take),
        total,
      },
    };
  }

  private parseWhereClause(
    pagingDto: PagingDto,
    where?: WhereClause,
  ): WhereClause {
    const result = {};
    if (where) {
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
              contains: where[key],
            };
            break;
          default:
            break;
        }
      }
    } else {
      for (const key of Object.keys(pagingDto)) {
        if (key.indexOf('__') < 0) continue;

        const splitKey = key.split('__');

        if (splitKey.length !== 2) {
          continue;
        }

        switch (splitKey[0]) {
          case 'where':
            result[splitKey[1]] = pagingDto[key];
            break;
          case 'like':
            result[splitKey[1]] = {
              contains: pagingDto[key],
            };
            break;
          default:
            break;
        }
      }
    }

    return result;
  }
}
