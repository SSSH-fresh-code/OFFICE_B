import { Module } from '@nestjs/common';
import { InfraModule } from 'src/infrastructure/infra.module';
import { TopicService } from './application/topic/topic.service';
import { POST_REPOSITORY, POST_SERVICE, SERIES_REPOSITORY, SERIES_SERVICE, TOPIC_REPOSITORY } from './blog.const';
import { PrismaTopicRepository } from 'src/infrastructure/db/repositories/prisma-topic.repository';
import { TopicController } from './presentation/topic/topic.controller';
import { PrismaSeriesRepository } from 'src/infrastructure/db/repositories/prisma-series.repository';
import { SeriesService } from './application/series/series.service';
import { SeriesController } from './presentation/series/series.controller';
import { PostService } from './application/post/post.service';
import { PrismaPostRepository } from 'src/infrastructure/db/repositories/prisma-post.repository';
import { USER_REPOSITORY } from '../user/user.const';
import { PrismaUserRepository } from 'src/infrastructure/db/repositories/prisma-user.repository';

@Module({
  imports: [InfraModule],
  providers: [
    TopicService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository
    },
    {
      provide: TOPIC_REPOSITORY,
      useClass: PrismaTopicRepository
    },
    {
      provide: SERIES_REPOSITORY,
      useClass: PrismaSeriesRepository
    },
    {
      provide: POST_REPOSITORY,
      useClass: PrismaPostRepository
    },
    {
      provide: SERIES_SERVICE,
      useClass: SeriesService
    },
    {
      provide: POST_SERVICE,
      useClass: PostService
    }
  ],
  controllers: [TopicController, SeriesController]
})
export class BlogModule { }
