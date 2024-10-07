import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { Logger } from "winston";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PermissionsMethod } from "src/infrastructure/decorator/permissions.decorator";
import { PermissionEnum } from "src/domain/permission/domain/permission.enum";
import { Page } from "src/infrastructure/common/services/paging.service";
import { POST_SERVICE } from "../../blog.const";
import { iPostService } from "../../application/post/post.service.interface";
import { ReadPostDto } from "./dto/read-post.dto";
import { PagingPostDto } from "./dto/paging-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@ApiTags("blog")
@Controller("post")
export class PostController {
	constructor(
		@Inject(POST_SERVICE) private readonly postService: iPostService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {}

	@Get(":title")
	@ApiOperation({ summary: "게시글 단건 조회" })
	@ApiResponse({
		status: 200,
		description: "게시글이 정상적으로 조회됨",
	})
	async getPostByTitle(@Param("title") title: string): Promise<ReadPostDto> {
		return await this.postService.getPostByTitle(title);
	}

	@Get()
	@ApiOperation({ summary: "게시글 다건 조회" })
	@ApiResponse({
		status: 200,
		description: "게시글들이 정상적으로 조회됨",
	})
	async getPosts(@Query() dto: PagingPostDto): Promise<Page<ReadPostDto>> {
		if (dto.where__seriesId) dto.where__seriesId = Number(dto.where__seriesId);
		if (dto.where__topicId) dto.where__topicId = Number(dto.where__topicId);
		return await this.postService.getPosts(dto);
	}

	@Post()
	@ApiOperation({ summary: "신규 게시글 생성" })
	@ApiResponse({
		status: 201,
		description: "게시글이 정상적으로 생성 됨",
	})
	@ApiResponse({ status: 400, description: "잘못된 파라미터 값" })
	@ApiBody({ type: CreatePostDto })
	@PermissionsMethod(PermissionEnum.CAN_USE_BLOG, PermissionEnum.CAN_WRITE_BLOG)
	async createSeries(@Body() dto: CreatePostDto): Promise<ReadPostDto> {
		return await this.postService.createPost(dto);
	}

	@Put()
	@ApiOperation({ summary: "게시글 수정" })
	@ApiResponse({
		status: 201,
		description: "게시글이 정상적으로 수정 됨",
	})
	@ApiResponse({ status: 400, description: "잘못된 파라미터 값" })
	@ApiBody({ type: UpdatePostDto })
	@PermissionsMethod(PermissionEnum.CAN_USE_BLOG, PermissionEnum.CAN_WRITE_BLOG)
	async updatePost(@Body() dto: UpdatePostDto): Promise<ReadPostDto> {
		return await this.postService.updatePost(dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "게시글 삭제" })
	@ApiResponse({
		status: 200,
		description: "게시글 단건 삭제",
	})
	@PermissionsMethod(PermissionEnum.CAN_USE_BLOG, PermissionEnum.CAN_WRITE_BLOG)
	async deletePost(@Param("id", ParseIntPipe) id: number): Promise<void> {
		try {
			await this.postService.deletePost(id);
		} catch (e) {
			this.logger.error(e);
			throw e;
		}
	}
}
