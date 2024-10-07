import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "src/infrastructure/module/logger.module";
import { PrismaService } from "../prisma.service";
import { Prisma } from "@prisma/client";
import { SeriesRepository } from "src/domain/blog/infrastructure/series/series.repository";
import { Series } from "src/domain/blog/domain/series/series.entity";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";
import { iSeries } from "src/domain/blog/domain/series/series.interface";
import { iTopic } from "src/domain/blog/domain/topic/topic.interface";
import { PrismaSeriesRepository } from "./prisma-series.repository";

describe("PrismaSeriesRepository", () => {
	let repository: SeriesRepository;
	let prisma: PrismaService;
	let topic: iTopic;
	let series: iSeries;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule],
			providers: [PrismaService, PrismaSeriesRepository, ConfigService],
		}).compile();

		repository = module.get<SeriesRepository>(PrismaSeriesRepository);
		prisma = module.get<PrismaService>(PrismaService);

		const prismaTopic = await prisma.topic.create({
			data: {
				name: "topic",
			},
		});

		topic = Topic.of(prismaTopic);
	});

	beforeEach(async () => {
		await prisma.cleanDatabase(["Series"]);
		series = new Series(1, "series", topic);
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe("findById", () => {
		it("id로 Series을 조회합니다.", async () => {
			const { id } = await prisma.series.create({
				data: {
					id: series.id,
					name: series.name,
					topicId: topic.id,
				},
			});

			const s = await repository.findById(id);

			expect(s.id).toEqual(series.id);
			expect(s.name).toEqual(series.name);
			expect(s.topic.id).toEqual(series.topic.id);
		});

		it("존재하지 않는 Series을 조회합니다.", async () => {
			await expect(() => repository.findById(1)).rejects.toThrow(
				Prisma.PrismaClientKnownRequestError,
			);
		});
	});

	describe("findByName", () => {
		it("name으로 Series을 조회합니다.", async () => {
			const { name } = await prisma.series.create({
				data: {
					id: series.id,
					name: series.name,
					topicId: topic.id,
				},
			});

			const s = await repository.findByName(name);

			expect(s.id).toEqual(series.id);
			expect(s.name).toEqual(series.name);
			expect(s.topic.id).toEqual(series.topic.id);
		});

		it("존재하지 않는 Series을 조회합니다.", async () => {
			await expect(() => repository.findByName("Wrong")).rejects.toThrow(
				Prisma.PrismaClientKnownRequestError,
			);
		});
	});

	describe("save", () => {
		it("Series을 생성합니다.", async () => {
			const s = await repository.save(series);

			expect(series.id).not.toEqual(s.id);
			expect(series.name).toEqual(s.name);
			expect(series.topic.id).toEqual(topic.id);
		});

		it("이미 존재하는 이름으로 Series을 생성합니다.", async () => {
			await prisma.series.create({
				data: {
					id: series.id,
					name: series.name,
					topicId: topic.id,
				},
			});

			await expect(() =>
				repository.save(new Series(0, series.name, topic)),
			).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
		});
	});

	describe("update", () => {
		it("Series 이름을 수정합니다.", async () => {
			const updateName = series.name + "2";
			const { id } = await prisma.series.create({
				data: {
					id: series.id,
					name: series.name,
					topicId: topic.id,
				},
			});

			const s = new Series(id, updateName, topic);

			const updatedSeries = await repository.update(s);

			expect(series.id).toEqual(updatedSeries.id);
			expect(series.name).not.toEqual(updatedSeries.name);
			expect(updateName).toEqual(updatedSeries.name);
			expect(series.topic.id).toEqual(updatedSeries.topic.id);
		});

		it("Series 주제를 수정합니다.", async () => {
			const anotherTopic = await prisma.topic.create({
				data: { name: "topic2" },
			});

			const { id, name } = await prisma.series.create({
				data: {
					id: series.id,
					name: series.name,
					topicId: topic.id,
				},
			});

			const s = new Series(id, name, Topic.of(anotherTopic));

			const updatedSeries = await repository.update(s);

			expect(series.id).toEqual(updatedSeries.id);
			expect(series.name).toEqual(updatedSeries.name);
			expect(series.topic.id).not.toEqual(updatedSeries.topic.id);
			expect(anotherTopic.id).toEqual(updatedSeries.topic.id);
		});

		it("이미 존재하는 이름으로 Series을 수정합니다.", async () => {
			await prisma.series.create({
				data: {
					id: series.id,
					name: series.name,
					topicId: topic.id,
				},
			});

			const { id } = await prisma.series.create({
				data: {
					name: series.name + "2",
					topicId: topic.id,
				},
			});

			const updatedSeries = new Series(id, series.name, topic);

			await expect(() => repository.update(updatedSeries)).rejects.toThrow(
				Prisma.PrismaClientKnownRequestError,
			);
		});

		it("존재하지 않는 Series을 수정합니다.", async () => {
			await expect(() => repository.update(series)).rejects.toThrow(
				Prisma.PrismaClientKnownRequestError,
			);
		});
	});

	describe("delete", () => {
		it("Series을 삭제합니다.", async () => {
			const { id } = await prisma.series.create({
				data: {
					name: series.name,
					topicId: topic.id,
				},
			});

			expect(() => repository.delete(id)).resolves;
		});

		it("존재하지 않는 Series을 삭제합니다.", async () => {
			await expect(() => repository.delete(series.id)).rejects.toThrow(
				Prisma.PrismaClientKnownRequestError,
			);
		});
	});
});
