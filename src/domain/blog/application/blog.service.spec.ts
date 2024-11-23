import { Test, TestingModule } from "@nestjs/testing";
import { LogService } from "src/infrastructure/common/log/application/log.service";
import { LogDto } from "src/infrastructure/common/log/presentation/dto/log.dto";
import { v4 as uuidv4 } from "uuid";
import { PagingDto } from "../../../infrastructure/common/dto/paging.dto";
import { Page } from "../../../infrastructure/common/services/paging.service";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { PermissionEnum } from "../../permission/domain/permission.enum";
import { User } from "../../user/domain/user.entity";
import { BLOG_SERVICE, LOG_SERVICE, POST_SERVICE } from "../blog.const";
import { Post } from "../domain/post/post.entity";
import { Series } from "../domain/series/series.entity";
import { Topic } from "../domain/topic/topic.entity";
import { ReadPostDto } from "../presentation/post/dto/read-post.dto";
import { BlogService } from "./blog.service";
import { iBlogService } from "./blog.service.interface";
import { iPostService } from "./post/post.service.interface";

const mockPostService = (): iPostService => ({
	getPostById: jest.fn(),
	getPostByTitle: jest.fn(),
	getPosts: jest.fn(),
	createPost: jest.fn(),
	updatePost: jest.fn(),
	deletePost: jest.fn(),
});

const mockLogService = () => ({
	getLogs: jest.fn(),
});

describe("BlogService", () => {
	let blogService: iBlogService;
	let postService: jest.Mocked<iPostService>;
	let logService: jest.Mocked<LogService>;

	const loginPerm = [PermissionEnum.CAN_LOGIN];
	// const SuPerm = [PermissionEnum.SUPER_USER];
	const uBlogPerm = [PermissionEnum.CAN_USE_BLOG];
	const rBlogPerm = [PermissionEnum.CAN_READ_BLOG];
	const wBlogPerm = [PermissionEnum.CAN_WRITE_BLOG];
	const rwBlogPerm = [
		PermissionEnum.CAN_WRITE_BLOG,
		PermissionEnum.CAN_READ_BLOG,
	];

	const blogPermissions = [uBlogPerm, rBlogPerm, wBlogPerm, rwBlogPerm];

	const user = new User(
		"mmm-mm-mmmm",
		"email@test.com",
		"password",
		"name",
		[],
	);
	const topic = new Topic(1, "topic");
	const series = new Series(1, "series", topic);
	const post = new Post(
		1,
		"title",
		"content",
		user,
		topic,
		series,
		"0001.avif",
	);

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: POST_SERVICE, useFactory: mockPostService },
				{ provide: BLOG_SERVICE, useClass: BlogService },
				{ provide: LOG_SERVICE, useFactory: mockLogService },
			],
		}).compile();

		blogService = module.get<iBlogService>(BLOG_SERVICE);
		postService = module.get<jest.Mocked<iPostService>>(POST_SERVICE);
		logService = module.get<jest.Mocked<LogService>>(LOG_SERVICE);
	});

	describe("getMain", () => {
		it("권한에 따른 최근 게시글 조회 테스트", async () => {
			const uuid = uuidv4();
			const pagingDto: PagingDto = {
				page: 1,
				take: 5,
				orderby: "createdAt",
				direction: "desc",
			};

			const postPage: Page<ReadPostDto> = {
				data: [post.toDto()],
				info: {
					total: 1,
					current: 1,
					take: 5,
					last: 1,
				},
			};

			const logPage: Page<LogDto> = {
				data: [],
				info: {
					total: 1,
					current: 1,
					take: 5,
					last: 1,
				},
			};

			postService.getPosts.mockResolvedValue(postPage);
			logService.getLogs.mockResolvedValue(logPage);

			for (let i = 0; i < blogPermissions.length; i++) {
				const mainPageDto = await blogService.getMain({
					id: uuid,
					permissions: [...loginPerm, ...blogPermissions[i]],
				});

				expect(mainPageDto).toBeDefined();
				expect(mainPageDto).toEqual({
					recentPosts: postPage,
				});
				expect(postService.getPosts).toHaveBeenCalledWith(pagingDto);
			}
		});

		it("권한이 없는 경우 최근 게시글 조회 테스트", async () => {
			const mainPageDto = await blogService.getMain({
				id: uuidv4(),
				permissions: [...loginPerm],
			});

			expect(mainPageDto).toBeDefined();
		});

		it("로그인 권한 없이 Main 데이터 조회", async () => {
			await expect(() =>
				blogService.getMain({
					id: uuidv4(),
					permissions: [],
				}),
			).rejects.toThrow(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("extractSiteMapFromPosts", () => {
		it("siteMap 추출", async () => {
			const siteMap = await blogService.extractSiteMapFromPosts();

			postService.getPosts.mockResolvedValue({
				info: {
					current: 1,
					last: 1,
					total: 3,
					take: 9999,
				},
				data: [post.toDto()],
			});

			expect(siteMap.length).toBeGreaterThan(0);
		});

		it("게시글이 없어도 기본 정보 추출", async () => {
			const siteMap = await blogService.extractSiteMapFromPosts();

			postService.getPosts.mockResolvedValue({
				info: {
					current: 1,
					last: 1,
					total: 3,
					take: 9999,
				},
				data: [],
			});

			expect(siteMap.length).toBeGreaterThan(0);
		});
	});
});
