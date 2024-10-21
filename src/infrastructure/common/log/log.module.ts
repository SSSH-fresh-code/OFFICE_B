import { Module } from "@nestjs/common";
import { LogService } from "./application/log.service";
import { LOG_REPOSITORY } from "./log.const";
import { PrismaLogRepository } from "src/infrastructure/db/repositories/prisma-log.repository";
import { LogController } from "./presentation/log.controller";
import { InfraModule } from "src/infrastructure/infra.module";

@Module({
	imports: [InfraModule],
	providers: [
		LogService,
		{
			provide: LOG_REPOSITORY,
			useClass: PrismaLogRepository,
		},
	],
	controllers: [LogController],
})
export class LogModule {}
