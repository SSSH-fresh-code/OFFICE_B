import { Module } from '@nestjs/common';
import { InfraModule } from 'src/infrastructure/infra.module';
import { TopicService } from './application/topic/topic.service';
import { SERIES_REPOSITORY, SERIES_SERVICE, TOPIC_REPOSITORY } from './blog.const';
import { PrismaTopicRepository } from 'src/infrastructure/db/repositories/prisma-topic.repository';
import { TopicController } from './presentation/topic/topic.controller';
import { PrismaSeriesRepository } from 'src/infrastructure/db/repositories/prisma-series.repository';
import { SeriesService } from './application/series/series.service';
import { SeriesController } from './presentation/series/series.controller';

@Module({
  imports: [InfraModule],
  providers: [
    TopicService,
    {
      provide: TOPIC_REPOSITORY,
      useClass: PrismaTopicRepository
    },
    {
      provide: SERIES_REPOSITORY,
      useClass: PrismaSeriesRepository
    },
    {
      provide: SERIES_SERVICE,
      useClass: SeriesService
    }
  ],
  controllers: [TopicController, SeriesController]
})
export class BlogModule { }
