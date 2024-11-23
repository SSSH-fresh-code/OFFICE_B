import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import * as session from "express-session";
import * as passport from "passport";
import * as request from "supertest";
import { AppModule } from "../../../app.module";
import { PrismaService } from "../../../infrastructure/db/prisma.service";
import { PrismaClientExceptionFilter } from "../../../infrastructure/filter/exception/prisma-exception.filter";
import { PermissionEnum } from "../../permission/domain/permission.enum";

describe("BlogController (e2e)", () => {
	let app: INestApplication;
	let prismaService: PrismaService;
	let su: string;
	let gu: string;

	const superUser = {
		email: "super@super.com",
		password: bcrypt.hashSync("password", 10),
		name: "super",
	};
	const guestUser = {
		email: "guest@guest.com",
		password: bcrypt.hashSync("password", 10),
		name: "guest",
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.use(
			session({
				secret: "test-secret",
				resave: false,
				saveUninitialized: false,
				store: new session.MemoryStore(),
			}),
		);

		app.use(passport.initialize());
		app.use(passport.session());

		app.useGlobalPipes(new ValidationPipe());
		app.useGlobalFilters(new PrismaClientExceptionFilter());

		await app.init();
		prismaService = moduleFixture.get<PrismaService>(PrismaService);

		await prismaService.user.create({
			data: {
				...superUser,
				permissions: {
					connect: [
						{
							name: PermissionEnum.CAN_LOGIN,
						},
						{
							name: PermissionEnum.CAN_READ_BLOG,
						},
					],
				},
			},
		});

		await prismaService.user.create({
			data: {
				...guestUser,
				permissions: {
					connect: [
						{
							name: PermissionEnum.CAN_LOGIN,
						},
					],
				},
			},
		});

		let response = await request(app.getHttpServer())
			.post("/auth/login")
			.send({ email: superUser.email, password: "password" });

		su = response.headers["set-cookie"];

		response = await request(app.getHttpServer())
			.post("/auth/login")
			.send({ email: guestUser.email, password: "password" });

		gu = response.headers["set-cookie"];
	});

	beforeEach(async () => {
		await prismaService.cleanDatabase(["Topic", "Series", "Post"]);
		const createTopic = await prismaService.topic.create({
			data: {
				name: "topic",
			},
		});

		const createSeries = await prismaService.series.create({
			data: {
				name: "topic",
				topicId: createTopic.id,
			},
		});

		await prismaService.post.create({
			data: {
				title: "post test",
				content: "test content",
				authorName: superUser.name,
				topicId: createTopic.id,
				seriesId: createSeries.id,
				thumbnail: "0001.avif",
			},
		});
	});

	describe("GET - /blog", () => {
		it("블로그 메인 페이지 데이터 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get("/blog")
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.recentPosts).toBeDefined();
			expect(body.recentPosts.info.total).toBe(1);

			return;
		});
	});

	describe("GET - /sitemap", () => {
		it("사이트맵 추출", async () => {
			const { statusCode, body, headers } = await request(app.getHttpServer())
				.get("/blog/sitemap")
				.set("Cookie", su);

			console.log(headers);
			expect(statusCode).toEqual(200);
			expect(body).toBeDefined();
			expect(headers["content-type"].includes("application/xml")).toBeTruthy();

			return;
		});
	});
});
