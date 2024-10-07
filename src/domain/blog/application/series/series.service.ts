import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { SERIES_REPOSITORY, TOPIC_REPOSITORY } from "../../blog.const";
import {
	Page,
	PagingService,
} from "src/infrastructure/common/services/paging.service";
import { Topic } from "../../domain/topic/topic.entity";
import { iSeriesService } from "./series.service.interface";
import { ReadSeriesDto } from "../../presentation/series/dto/read-series.dto";
import { SeriesRepository } from "../../infrastructure/series/series.repository";
import { PagingSeriesDto } from "../../presentation/series/dto/paging-series.dto";
import { Series } from "../../domain/series/series.entity";
import { Series as PrismaSeries, Topic as PrismaTopic } from "@prisma/client";
import { CreateSeriesDto } from "../../presentation/series/dto/create-series.dto";
import { TopicRepository } from "../../infrastructure/topic/topic.repository";
import { UpdateSeriesDto } from "../../presentation/series/dto/update-series.dto";
import { SsshException } from "src/infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";

@Injectable()
export class SeriesService implements iSeriesService {
	constructor(
		@Inject(TOPIC_REPOSITORY) private readonly topicRepository: TopicRepository,
		@Inject(SERIES_REPOSITORY)
		private readonly seriesRepository: SeriesRepository,
		private readonly pagingService: PagingService<PrismaSeries>,
	) {}
	async getSeriesByTopicIdForSelect(
		topicId: number,
	): Promise<Pick<ReadSeriesDto, "id" | "name">[]> {
		const series = await this.seriesRepository.findAllByTopicId(topicId);
		return series;
	}

	async getSeriesByName(name: string): Promise<ReadSeriesDto> {
		const series = await this.seriesRepository.findByName(name);

		return series.toDto();
	}

	async getSeries(dto: PagingSeriesDto): Promise<Page<ReadSeriesDto>> {
		const where = {};
		const orderby = {};

		if (dto.like__name) where["like__name"] = dto.like__name;
		if (dto.where__topicId) where["where__topicId"] = dto.where__topicId;
		if (dto.orderby && dto.direction) orderby[dto.orderby] = dto.direction;

		const series = await this.pagingService.getPagedResults(
			"Series",
			dto,
			where,
		);

		return {
			data: series.data.map((t: PrismaSeries & { topic: PrismaTopic }) => {
				return Series.of(t, Topic.of(t.topic)).toDto();
			}),
			info: series.info,
		};
	}

	async createSeries(dto: CreateSeriesDto): Promise<ReadSeriesDto> {
		const topic = await this.topicRepository.findById(dto.topicId);

		const series = new Series(0, dto.name, topic);

		const createdSeries = await this.seriesRepository.save(series);

		return createdSeries.toDto();
	}

	async updateSeries(dto: UpdateSeriesDto): Promise<ReadSeriesDto> {
		let isUpdated = false;
		const series = await this.seriesRepository.findById(dto.id);

		if (dto.name && series.name !== dto.name) {
			series.name = dto.name;
			isUpdated = true;
		}

		if (dto.topicId && series.topic.id !== dto.topicId) {
			const topicForUpdate = await this.topicRepository.findById(dto.topicId);

			series.topic = topicForUpdate;
			isUpdated = true;
		}

		if (isUpdated) {
			const updatedSeries = await this.seriesRepository.update(series);

			return updatedSeries.toDto();
		} else {
			throw new SsshException(
				ExceptionEnum.NOT_MODIFIED,
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async deleteSeries(id: number) {
		await this.seriesRepository.delete(id);
	}
}
