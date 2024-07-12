import { Module } from '@nestjs/common';
import { InfraModule } from 'src/infrastructure/infra.module';
import { TopicService } from './application/topic/topic.service';
import { TOPIC_REPOSITORY } from './blog.const';
import { PrismaTopicRepository } from 'src/infrastructure/db/repositories/prisma-topic.repository';
import { TopicController } from './presentation/topic/topic.controller';

@Module({
  imports: [InfraModule],
  providers: [
    TopicService,
    {
      provide: TOPIC_REPOSITORY,
      useClass: PrismaTopicRepository
    }
  ],
  controllers: [TopicController]
})
export class BlogModule { }
