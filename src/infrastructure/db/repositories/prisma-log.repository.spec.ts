import { Test, TestingModule } from "@nestjs/testing";
import { v4 as uuidv4 } from "uuid";
import { PrismaLogRepository } from "./prisma-log.repository";
import { PrismaService } from "../prisma.service";
import { Log } from "src/infrastructure/common/log/domain/log.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "src/infrastructure/module/logger.module";
import { Prisma } from "@prisma/client";

describe("PrismaLogRepository", () => {
	let repository: PrismaLogRepository;
	let prisma: PrismaService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule],
			providers: [PrismaService, PrismaLogRepository, ConfigService],
		}).compile();

		repository = module.get<PrismaLogRepository>(PrismaLogRepository);
		prisma = module.get<PrismaService>(PrismaService);

		// Foreign key constraints 해제 (필요한 경우)
		await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
	});

	beforeEach(async () => {
		// 테스트 전마다 로그 테이블을 정리
		await prisma.cleanDatabase(["Log"]);
	});

	afterAll(async () => {
		// DB 연결 해제
		await prisma.$disconnect();
	});

	describe("findById", () => {
		it("로그를 성공적으로 조회해야 합니다.", async () => {
			const log = new Log("SERVER_NOTIFY", "JSON", '{"action": "notify"}');
			await repository.save(log);

			const foundLog = await repository.findById(log.id);
			expect(foundLog).toEqual(
				expect.objectContaining({
					businessType: "SERVER_NOTIFY",
					dataType: "JSON",
					data: '{"action": "notify"}',
				}),
			);
		});

		it("존재하지 않는 로그 ID로 조회 시 null을 반환해야 합니다.", async () => {
			await expect(repository.findById("invalid-uuid")).rejects.toThrow(
				Prisma.PrismaClientKnownRequestError,
			);
		});
	});

	describe("save", () => {
		it("로그를 성공적으로 저장해야 합니다.", async () => {
			const log = new Log("USER_REGISTRATION", "JSON", '{"userId": "1234"}');
			const savedLog = await repository.save(log);

			expect(savedLog).toEqual(
				expect.objectContaining({
					businessType: "USER_REGISTRATION",
					dataType: "JSON",
					data: '{"userId": "1234"}',
				}),
			);
		});

		it("로그 저장 시 자동으로 UUID가 생성되어야 합니다.", async () => {
			const log = new Log("USER_LOGIN", "JSON", '{"userId": "5678"}');
			const savedLog = await repository.save(log);

			expect(savedLog.id).toBeDefined();
			expect(savedLog.id).toHaveLength(36); // UUID는 36자의 길이를 가져야 함
		});

		it("잘못된 데이터 타입으로 로그 저장 시 예외를 발생시켜야 합니다.", async () => {
			const log = new Log("INVALID_TYPE", null, '{"invalid": "data"}');
			await expect(repository.save(log)).rejects.toThrow();
		});

		it("빈 데이터를 저장하려 할 경우 예외를 발생시켜야 합니다.", async () => {
			const log = new Log("SERVER_NOTIFY", "JSON", null); // 데이터가 없음
			await expect(repository.save(log)).rejects.toThrow();
		});
	});
});
