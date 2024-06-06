import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    // Prisma client 인스턴스의 모델들을 추출하여 데이터베이스를 정리합니다.
    const modelNames = Object.keys(this).filter(
      key => this[key] && this[key].deleteMany
    );

    for (const modelName of modelNames) {
      await this[modelName].deleteMany();
    }
  }
}