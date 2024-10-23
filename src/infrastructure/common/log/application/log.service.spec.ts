import { Test, TestingModule } from "@nestjs/testing";
import { LogService } from "src/infrastructure/common/log/application/log.service";
import { Log } from "src/infrastructure/common/log/domain/log.entity";
import { LogRepository } from "src/infrastructure/common/log/infrastructure/log.repository";
import { LOG_REPOSITORY } from "src/infrastructure/common/log/log.const";
import { CreateLogDto } from "src/infrastructure/common/log/presentation/dto/create-log.dto";
import { PrismaLogRepository } from "src/infrastructure/db/repositories/prisma-log.repository";
import { PagingService } from "../../services/paging.service";
import { BusinessType, DataType } from "../domain/log.enum";

/**
 * Mock Log Repository
 * 로그 저장소의 Mock 함수들을 정의합니다.
 */
const mockLogRepository = () => ({
	save: jest.fn(),
	findById: jest.fn(),
});

/**
 * Mock Paging Service
 * 페이징 서비스의 Mock 함수들을 정의합니다.
 */
const mockPagingService = () => ({
	getPagedResults: jest.fn(),
});

describe("LogService", () => {
	let logService: LogService;
	let logRepository: jest.Mocked<PrismaLogRepository>;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LogService,
				{ provide: PagingService, useFactory: mockPagingService },
				{ provide: LOG_REPOSITORY, useFactory: mockLogRepository },
			],
		}).compile();

		logService = module.get<LogService>(LogService);
		logRepository = module.get<LogRepository>(
			LOG_REPOSITORY,
		) as jest.Mocked<PrismaLogRepository>;
	});

	describe("createLog", () => {
		it("로그를 성공적으로 생성해야 합니다.", async () => {
			const createLogDto: CreateLogDto = {
				businessType: BusinessType.CHAT,
				dataType: DataType.JSON,
				data: '{"userId": "1234"}',
			};

			const log = new Log(
				createLogDto.businessType,
				createLogDto.dataType,
				createLogDto.data,
			);

			logRepository.save.mockResolvedValue(log);

			const result = await logService.createLog(createLogDto);

			expect(result).toEqual(log.toDto());
			expect(logRepository.save).toHaveBeenCalledWith(expect.any(Log));
		});
	});

	describe("getLogById", () => {
		it("ID(UUID)로 로그를 성공적으로 조회해야 합니다.", async () => {
			const log = new Log(
				BusinessType.CHAT,
				DataType.JSON,
				'{"action": "notify"}',
			);
			logRepository.findById.mockResolvedValue(log);

			const result = await logService.getLogById(log.id);

			expect(result).toEqual(log.toDto());
			expect(logRepository.findById).toHaveBeenCalledWith(log.id);
		});
	});
});
