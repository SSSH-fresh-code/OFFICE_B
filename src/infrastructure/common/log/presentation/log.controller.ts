import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
	ApiTags,
	ApiOperation,
	ApiBody,
	ApiResponse,
	ApiParam,
	ApiQuery,
	getSchemaPath,
} from "@nestjs/swagger";
import { LogService } from "../application/log.service";
import { CreateLogDto } from "../presentation/dto/create-log.dto";
import { LogDto } from "../presentation/dto/log.dto";
import { PagingLogDto } from "../presentation/dto/paging-log.dto";
import { Page } from "../../services/paging.service";
import { PermissionsMethod } from "src/infrastructure/decorator/permissions.decorator";
import { PermissionEnum } from "src/domain/permission/domain/permission.enum";

@ApiTags("logs")
@Controller("log")
export class LogController {
	constructor(private readonly logService: LogService) {}

	@Post()
	@ApiOperation({ summary: "신규 로그 생성" })
	@ApiResponse({
		status: 201,
		description: "로그가 정상적으로 생성됨",
	})
	@ApiResponse({ status: 400, description: "잘못된 파라미터 값" })
	@ApiBody({ type: CreateLogDto })
	@PermissionsMethod(PermissionEnum.CAN_USE_LOG, PermissionEnum.CAN_WRITE_LOG)
	async createLog(@Body() dto: CreateLogDto): Promise<LogDto> {
		return await this.logService.createLog(dto);
	}

	@Get()
	@ApiOperation({ summary: "로그 목록 조회" })
	@ApiResponse({
		status: 200,
		description: "로그 목록이 정상적으로 조회됨",
	})
	@ApiQuery({
		name: "page",
		required: false,
		description: "페이지 번호",
		type: Number,
	})
	@ApiQuery({
		name: "take",
		required: false,
		description: "페이지당 항목 개수",
		type: Number,
	})
	@ApiQuery({
		name: "orderby",
		required: false,
		description: "정렬 필드",
		type: Number,
	})
	@ApiQuery({
		name: "direction",
		required: false,
		description: "정렬 기준",
		type: String,
	})
	@ApiQuery({
		name: "where__businessType",
		required: false,
		description: "업무 타입",
		type: String,
	})
	@ApiQuery({
		name: "where__dataType",
		required: false,
		description: "데이터 타입",
		type: String,
	})
	@PermissionsMethod(PermissionEnum.CAN_USE_LOG, PermissionEnum.CAN_READ_LOG)
	async getLogs(@Query() pagingDto: PagingLogDto): Promise<Page<LogDto>> {
		return await this.logService.getLogs(pagingDto);
	}

	@Get(":id")
	@ApiOperation({ summary: "로그 ID 조회" })
	@ApiParam({
		name: "id",
		required: true,
		description: "조회할 로그의 고유 ID(UUID)",
		type: String,
	})
	@ApiResponse({
		status: 200,
		description: "로그 ID 조회 성공",
		content: {
			"application/json": {
				schema: {
					$ref: getSchemaPath(LogDto),
				},
			},
		},
	})
	@PermissionsMethod(PermissionEnum.CAN_USE_LOG, PermissionEnum.CAN_READ_LOG)
	async getLogById(@Param("id") id: string): Promise<LogDto> {
		return await this.logService.getLogById(id);
	}
}
