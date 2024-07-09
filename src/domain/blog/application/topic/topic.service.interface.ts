import { Page } from "src/infrastructure/common/services/paging.service";
import { ReadTopicDto } from "../../presentation/topic/dto/read-topic.dto";
import { PagingTopicDto } from "../../presentation/topic/dto/paging-topic.dto";
import { CreateTopicDto } from "../../presentation/topic/dto/create-topic.dto";
import { UpdateTopicDto } from "../../presentation/topic/dto/update-topic.dto";

export interface iTopicService {
  getTopicByName(name: string): Promise<ReadTopicDto>;
  getTopics(dto: PagingTopicDto): Promise<Page<ReadTopicDto>>;
  createTopic(dto: CreateTopicDto): Promise<ReadTopicDto>;
  updateTopic(dto: UpdateTopicDto): Promise<ReadTopicDto>;
  deleteTopic(name: string): Promise<void>;
}
