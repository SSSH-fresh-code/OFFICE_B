import { Inject, Injectable } from "@nestjs/common";
import { iTopicService } from "./topic.service.interface";
import { TOPIC_REPOSITORY } from "../../blog.const";
import { TopicRepository } from "../../infrastructure/topic/topic.repository";
import {
	Page,
	PagingService,
} from "src/infrastructure/common/services/paging.service";
import { Topic } from "../../domain/topic/topic.entity";
import { Topic as PrismaTopic } from "@prisma/client";
import { PagingTopicDto } from "../../presentation/topic/dto/paging-topic.dto";
import { CreateTopicDto } from "../../presentation/topic/dto/create-topic.dto";
import { UpdateTopicDto } from "../../presentation/topic/dto/update-topic.dto";
import { ReadTopicDto } from "../../presentation/topic/dto/read-topic.dto";

@Injectable()
export class TopicService implements iTopicService {
	constructor(
		@Inject(TOPIC_REPOSITORY) private readonly topicRepository: TopicRepository,
		private readonly pagingService: PagingService<PrismaTopic>,
	) {}

	async getTopicByName(name: string): Promise<ReadTopicDto> {
		const topic = await this.topicRepository.findByName(name);

		return topic.toDto();
	}

	async getTopics(dto: PagingTopicDto): Promise<Page<ReadTopicDto>> {
		const where = {};
		const orderby = {};

		if (dto.like__name) where["like__name"] = dto.like__name;
		if (dto.orderby && dto.direction) orderby[dto.orderby] = dto.direction;

		const topics = await this.pagingService.getPagedResults(
			"Topic",
			dto,
			where,
		);

		return {
			data: topics.data.map((t) => {
				return Topic.of(t as PrismaTopic).toDto();
			}),
			info: topics.info,
		};
	}

	async createTopic(dto: CreateTopicDto): Promise<ReadTopicDto> {
		const topic = new Topic(0, dto.name);

		const createdTopic = await this.topicRepository.save(topic);

		return createdTopic.toDto();
	}

	async updateTopic(dto: UpdateTopicDto): Promise<ReadTopicDto> {
		const topic = await this.topicRepository.findById(dto.id);

		topic.name = dto.name;

		const updatedTopic = await this.topicRepository.update(topic);

		return updatedTopic.toDto();
	}

	async deleteTopic(id: number) {
		await this.topicRepository.delete(id);
	}

	async getTopicForSelect(): Promise<Pick<ReadTopicDto, "id" | "name">[]> {
		return this.topicRepository.findAll();
	}
}
