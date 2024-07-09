import { Inject, Injectable } from "@nestjs/common";
import { iTopicService } from "./topic.service.interface";
import { TOPIC_REPOSITORY } from "../../blog.const";
import { TopicRepository } from "../../infrastructure/topic/topic.repository";
import { Page, PagingService } from "src/infrastructure/common/services/paging.service";
import { Topic } from "../../domain/topic/topic.entity";
import { PagingTopicDto } from "../../presentation/topic/dto/paging-topic.dto";
import { CreateTopicDto } from "../../presentation/topic/dto/create-topic.dto";
import { UpdateTopicDto } from "../../presentation/topic/dto/update-topic.dto";
import { ReadTopicDto } from "../../presentation/topic/dto/read-topic.dto";

@Injectable()
export class TopicService implements iTopicService {
  constructor(
    @Inject(TOPIC_REPOSITORY) private readonly topicRepository: TopicRepository,
    private readonly pagingService: PagingService<Topic>
  ) { }

  async getTopicByName(name: string): Promise<ReadTopicDto> {
    throw new Error("method not implements");
  };

  async getTopics(dto: PagingTopicDto): Promise<Page<ReadTopicDto>> {
    throw new Error("method not implements");
  };

  async createTopic(dto: CreateTopicDto): Promise<ReadTopicDto> {
    throw new Error("method not implements");
  };

  async updateTopic(dto: UpdateTopicDto): Promise<ReadTopicDto> {
    throw new Error("method not implements");
  };

  async deleteTopic(name: string) {
    throw new Error("method not implements");
  };
}
