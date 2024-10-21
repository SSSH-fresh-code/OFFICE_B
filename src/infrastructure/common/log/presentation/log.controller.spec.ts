import * as request from "supertest";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as session from "express-session";
import { PrismaService } from "src/infrastructure/db/prisma.service";
import { CreateLogDto } from "./dto/create-log.dto";
import { AppModule } from "src/app.module";
import { PrismaClientExceptionFilter } from "src/infrastructure/filter/exception/prisma-exception.filter";
import { PermissionEnum } from "src/domain/permission/domain/permission.enum";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { formatMessage } from "src/infrastructure/util/message.util";

describe("LogController (e2e)", () => {
	let app: INestApplication;
	let prismaService: PrismaService;
	let su: string;
	let gu: string;

	const createDto: CreateLogDto = {
		businessType: "USER_REGISTRATION",
		dataType: "JSON",
		data: '{"userId": "1234", "action": "register"}',
	};

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
							name: PermissionEnum.CAN_READ_LOG,
						},
						{
							name: PermissionEnum.CAN_WRITE_LOG,
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
		await prismaService.cleanDatabase(["Log"]);
	});

	describe("POST - /log", () => {
		it("로그 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/log")
				.set("Cookie", su)
				.send(createDto);

			expect(statusCode).toEqual(201);
			expect(body.businessType).toEqual(createDto.businessType);
			expect(body.dataType).toEqual(createDto.dataType);
			expect(body.data).toEqual(createDto.data);

			return;
		});

		it("권한 없이 로그 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/log")
				.set("Cookie", gu)
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

			return;
		});

		it("로그인 없이 로그 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/log")
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

			return;
		});
	});

	describe("GET - /log/:id", () => {
		it("로그 ID로 조회", async () => {
			const log = await prismaService.log.create({
				data: createDto,
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/log/${log.id}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.businessType).toEqual(log.businessType);
			expect(body.dataType).toEqual(log.dataType);
			expect(body.data).toEqual(log.data);
		});

		it("존재하지 않는 로그 ID로 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get("/log/999")
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});

		it("권한 없이 로그 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get("/log/0")
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /log", () => {
		it("로그 목록 조회", async () => {
			const log2: CreateLogDto = {
				businessType: "USER_REGISTRATION",
				dataType: "JSON",
				data: '{"userId": "1234", "action": "login"}',
			};

			await prismaService.log.createMany({
				data: [createDto, log2],
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(
					"/log?page=1&take=10&orderby=businessType&direction=asc&&where__businessType=USER_REGISTRATION",
				)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(2);
		});

		it("빈 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(
					"/log?page=1&take=10&orderby=businessType&direction=asc&where__dataType=JSON",
				)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(0);
		});

		it("필터 없이 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get("/log?page=1&take=10")
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(
				formatMessage(ExceptionEnum.PARAMETER_NOT_FOUND, { param: "type" }),
			);
		});

		it("권한 없이 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get("/log?page=1&take=10&orderby=businessType&direction=asc")
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});
});
