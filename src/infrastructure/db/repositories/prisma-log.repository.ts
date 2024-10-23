import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { LogRepository } from "src/infrastructure/common/log/infrastructure/log.repository";
import { Log } from "src/infrastructure/common/log/domain/log.entity";
import {
	BusinessType,
	DataType,
} from "src/infrastructure/common/log/domain/log.enum";

@Injectable()
export class PrismaLogRepository implements LogRepository {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * ID(UUID)로 로그를 조회합니다.
	 * 대상 로그가 존재하지 않으면 null을 반환합니다.
	 *
	 * @param {string} id - 조회할 로그의 ID(UUID)
	 */
	async findById(id: string): Promise<Log | null> {
		const log = await this.prisma.log.findUniqueOrThrow({
			where: { id },
		});

		return new Log(
			BusinessType[log.businessType],
			DataType[log.dataType],
			log.data,
			log.id,
			log.logDate,
		);
	}

	/**
	 * 로그를 저장합니다. 로그는 생성 후 수정되지 않으며, 저장만 가능합니다.
	 *
	 * @param {Log} log - 저장할 로그 정보
	 */
	async save(log: Log): Promise<Log> {
		const createdLog = await this.prisma.log.create({
			data: {
				id: log.id,
				businessType: log.businessType,
				dataType: log.dataType,
				data: log.data,
				logDate: log.logDate,
			},
		});

		return new Log(
			BusinessType[createdLog.businessType],
			DataType[createdLog.dataType],
			createdLog.data,
			createdLog.id,
			createdLog.logDate,
		);
	}
}
