import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { LOG_REPOSITORY } from "../log.const";
import { Log } from "../domain/log.entity";
import { CreateLogDto } from "../presentation/dto/create-log.dto";
import { LogRepository } from "../infrastructure/log.repository";
import { LogDto } from "../presentation/dto/log.dto";
import { Log as PrismaLog } from "@prisma/client";
import { Page, PagingService } from "../../services/paging.service";
import { SsshException } from "src/infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { PagingLogDto } from "../presentation/dto/paging-log.dto";

@Injectable()
export class LogService {
	constructor(
		@Inject(LOG_REPOSITORY) private readonly logRepository: LogRepository,
		private readonly pagingService: PagingService<PrismaLog>,
	) {}

	/**
	 * 로그를 생성합니다.
	 *
	 * @param {CreateLogDto} createLogDto - 로그 생성을 위한 DTO
	 */
	async createLog(createLogDto: CreateLogDto): Promise<LogDto> {
		const { businessType, dataType, data } = createLogDto;
		const log = new Log(businessType, dataType, data);

		const savedLog = await this.logRepository.save(log);
		return savedLog.toDto();
	}

	/**
	 * ID(UUID)로 로그를 조회합니다.
	 *
	 * @param {string} id - 조회할 로그의 ID(UUID)
	 */
	async getLogById(id: string): Promise<LogDto> {
		const log = await this.logRepository.findById(id);
		return log.toDto();
	}

	/**
	 * 타입으로 채팅을 조회합니다.
	 *
	 * 주어진 메신저 타입에 따른 채팅을 페이징 방식으로 조회합니다.
	 * `ChatPagingDto`를 통해 검색 조건을 전달받으며, 조건이 없을 경우 예외를 발생시킵니다.
	 *
	 * @param {ChatPagingDto} dto - 조회할 조건을 담은 DTO
	 * @returns {Promise<Page<ReadChatDto>>} 페이징된 채팅 결과를 반환하는 Promise
	 * @throws SsshException - type이 없을 경우 발생하는 예외
	 */
	async getLogs(dto: PagingLogDto): Promise<Page<LogDto>> {
		/** type이 존재하지 않는 경우 조회하지 않음 */
		if (!(dto.where__dataType || dto.where__businessType)) {
			throw new SsshException(
				ExceptionEnum.PARAMETER_NOT_FOUND,
				HttpStatus.BAD_REQUEST,
				{ param: "type" },
			);
		}

		const where: Record<string, string> = {};

		if (dto.where__dataType) {
			where.where__dataType = dto.where__dataType;
		}
		if (dto.where__businessType) {
			where.where__businessType = dto.where__businessType;
		}

		const orderBy = {};

		if (dto.orderby) orderBy[dto.orderby] = dto.direction;

		const pagingChats = await this.pagingService.getPagedResults(
			"Log",
			dto,
			where,
		);

		return {
			data: pagingChats.data.map((chat) => Log.of(chat).toDto()),
			info: pagingChats.info,
		};
	}
}
