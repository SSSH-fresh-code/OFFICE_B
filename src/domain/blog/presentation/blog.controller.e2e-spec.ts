import * as request from "supertest";
import * as session from "express-session";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/db/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../app.module";
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

		const createUser = await prismaService.user.create({
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

		const createPost = await prismaService.post.create({
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
});
