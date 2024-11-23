import { Controller, Get, Inject, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { PermissionsMethod } from "../../../infrastructure/decorator/permissions.decorator";
import { PermissionEnum } from "../../permission/domain/permission.enum";
import { iBlogService } from "../application/blog.service.interface";
import { BLOG_SERVICE } from "../blog.const";
import { MainPageDto } from "./dto/MainPageDto";

@ApiTags("blog")
@Controller("blog")
export class BlogController {
	constructor(
		@Inject(BLOG_SERVICE) private readonly blogService: iBlogService,
	) {}

	@Get("/")
	@ApiOperation({ summary: "메인페이지 데이터 조회" })
	@ApiResponse({
		status: 200,
		description: "메인페이지 데이터 정상적으로 조회됨",
	})
	@PermissionsMethod(PermissionEnum.CAN_LOGIN)
	async getPostByTitle(@Req() req: Request): Promise<MainPageDto> {
		return await this.blogService.getMain(req.user);
	}

	@Get("/sitemap")
	@ApiOperation({ summary: "사이트맵 추출" })
	@ApiResponse({
		status: 200,
		description: "메인페이지 데이터 정상적으로 조회됨",
	})
	@PermissionsMethod(PermissionEnum.CAN_LOGIN)
	async getSiteMap(@Res() res: Response) {
		const siteMap = await this.blogService.extractSiteMapFromPosts();

		res.setHeader("Content-Type", "application/xml");
		res.status(200).send(siteMap);
	}
}
