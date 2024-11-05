import { iBlogService } from "./blog.service.interface";
import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { PostService } from "./post/post.service";
import { UserInSession } from "src/domain/user/infrastructure/auth";
import { MainPageDto } from "../presentation/dto/MainPageDto";
import { LOG_SERVICE, POST_SERVICE } from "../blog.const";
import { PermissionEnum } from "../../permission/domain/permission.enum";
import { PagingDto } from "../../../infrastructure/common/dto/paging.dto";
import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { PagingLogDto } from "src/infrastructure/common/log/presentation/dto/paging-log.dto";
import { LogService } from "src/infrastructure/common/log/application/log.service";
import {
	BusinessType,
	DataType,
} from "src/infrastructure/common/log/domain/log.enum";

@Injectable()
export class BlogService implements iBlogService {
	private readonly logger = new Logger(BlogService.name);

	constructor(
		@Inject(POST_SERVICE) private readonly postService: PostService,
		@Inject(LOG_SERVICE) private readonly logService: LogService,
	) {}

	async getMain({ permissions }: UserInSession): Promise<MainPageDto> {
		const dto: MainPageDto = {};

		if (!permissions.includes(PermissionEnum.CAN_LOGIN)) {
			throw new SsshException(ExceptionEnum.FORBIDDEN, HttpStatus.FORBIDDEN);
		}

		const isSu = permissions.includes(PermissionEnum.SUPER_USER);

		let hasBlogPermission = isSu;
		let hasLogPermission = isSu;

		if (!hasBlogPermission) {
			hasBlogPermission =
				permissions.includes(PermissionEnum.CAN_USE_BLOG) ||
				permissions.includes(PermissionEnum.CAN_READ_BLOG) ||
				permissions.includes(PermissionEnum.CAN_WRITE_BLOG);
		}

		if (!hasLogPermission) {
			hasLogPermission =
				permissions.includes(PermissionEnum.CAN_USE_LOG) ||
				permissions.includes(PermissionEnum.CAN_READ_LOG);
		}

		if (hasBlogPermission) {
			const pagingDto: PagingDto = {
				page: 1,
				take: 5,
				orderby: "createdAt",
				direction: "desc",
			};
			try {
				dto.recentPosts = await this.postService.getPosts(pagingDto);
			} catch (e) {
				this.logger.error("getMain - getPosts Error");
				this.logger.debug(e);

				dto.recentPosts = {
					data: [],
					info: {
						total: 1,
						current: 1,
						take: 5,
						last: 1,
					},
				};
			}
		}

		if (hasLogPermission) {
			const pagingDto: PagingLogDto = {
				where__dataType: DataType.JSON,
				where__businessType: BusinessType.CHAT,
				page: 1,
				take: 5,
				orderby: "logDate",
				direction: "desc",
			};

			try {
				dto.recentMessage = await this.logService.getLogs(pagingDto);
			} catch (e) {
				dto.recentMessage = {
					data: [],
					info: {
						total: 1,
						current: 1,
						take: 5,
						last: 1,
					},
				};
			}
		}

		return dto;
	}
}
