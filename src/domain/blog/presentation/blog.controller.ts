import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Logger, Req } from "@nestjs/common";
import { BLOG_SERVICE } from "../blog.const";
import { iBlogService } from "../application/blog.service.interface";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { MainPageDto } from "./dto/MainPageDto";
import { PermissionsMethod } from "../../../infrastructure/decorator/permissions.decorator";
import { PermissionEnum } from "../../permission/domain/permission.enum";

@ApiTags("blog")
@Controller("blog")
export class BlogController {
	constructor(
		@Inject(BLOG_SERVICE) private readonly blogService: iBlogService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {}

	@Get("/")
	@ApiOperation({ summary: "메인페이지 데이터 조회" })
	@ApiResponse({
		status: 200,
		description: "메인페이지 데이터 정상적으로 조회됨",
	})
	@PermissionsMethod(PermissionEnum.CAN_LOGIN)
	async getPostByTitle(@Req() req: Request): Promise<MainPageDto> {
		return await this.blogService.getMain(req["user"]);
	}
}
