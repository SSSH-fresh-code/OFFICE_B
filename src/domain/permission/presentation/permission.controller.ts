import {
	Controller,
	Post,
	Body,
	Param,
	Put,
	Get,
	Delete,
} from "@nestjs/common";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { ReadPermissionDto } from "./dto/read-permission.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { PermissionService } from "../application/permission.service";
import {
	PermissionsClass,
	PermissionsMethod,
} from "../../../infrastructure/decorator/permissions.decorator";
import { PermissionEnum } from "../domain/permission.enum";

@ApiTags("permission")
@Controller("permission")
@PermissionsClass(PermissionEnum.CAN_USE_PERMISSION)
export class PermissionController {
	constructor(private readonly permissionService: PermissionService) {}

	@Post()
	@ApiOperation({ summary: "신규 권한 생성" })
	@ApiResponse({
		status: 201,
		description: "권한이 성공적으로 생성되었습니다.",
		type: ReadPermissionDto,
	})
	@ApiResponse({ status: 400, description: "잘못된 요청" })
	@ApiBody({ type: CreatePermissionDto })
	@PermissionsMethod(PermissionEnum.CAN_WRITE_PERMISSION)
	async createPermission(
		@Body() createPermissionDto: CreatePermissionDto,
	): Promise<ReadPermissionDto> {
		return await this.permissionService.createPermission(createPermissionDto);
	}

	@Put()
	@ApiOperation({ summary: "권한 수정" })
	@ApiResponse({
		status: 200,
		description: "권한이 성공적으로 수정되었습니다.",
		type: ReadPermissionDto,
	})
	@ApiResponse({ status: 404, description: "권한을 찾을 수 없습니다." })
	@ApiBody({ type: UpdatePermissionDto })
	@PermissionsMethod(PermissionEnum.CAN_WRITE_PERMISSION)
	async updatePermission(
		@Body() updatePermissionDto: UpdatePermissionDto,
	): Promise<ReadPermissionDto> {
		return await this.permissionService.updatePermission(updatePermissionDto);
	}

	@Get()
	@ApiOperation({ summary: "모든 권한 조회" })
	@ApiResponse({
		status: 200,
		description: "모든 권한이 성공적으로 조회되었습니다.",
		type: [ReadPermissionDto],
	})
	@PermissionsMethod(PermissionEnum.CAN_READ_PERMISSION)
	async getPermissions(): Promise<ReadPermissionDto[]> {
		return await this.permissionService.getPermissions();
	}

	@Get(":name")
	@ApiOperation({ summary: "권한 상세 조회" })
	@ApiResponse({
		status: 200,
		description: "권한이 성공적으로 조회되었습니다.",
		type: ReadPermissionDto,
	})
	@ApiResponse({ status: 404, description: "권한을 찾을 수 없습니다." })
	@PermissionsMethod(PermissionEnum.CAN_READ_PERMISSION)
	async getPermissionByName(
		@Param("name") name: string,
	): Promise<ReadPermissionDto> {
		return await this.permissionService.getPermissionByName(name);
	}

	@Delete(":name")
	@ApiOperation({ summary: "권한 삭제" })
	@ApiResponse({
		status: 200,
		description: "권한이 성공적으로 삭제되었습니다.",
	})
	@ApiResponse({ status: 404, description: "권한을 찾을 수 없습니다." })
	@PermissionsMethod(PermissionEnum.CAN_WRITE_PERMISSION)
	async removePermission(@Param("name") name: string): Promise<void> {
		await this.permissionService.deletePermission(name);
	}
}
