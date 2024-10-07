import * as request from "supertest";
import * as session from "express-session";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/db/prisma.service";
import { CreateTopicDto } from "./dto/create-topic.dto";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaClientExceptionFilter } from "src/infrastructure/filter/exception/prisma-exception.filter";
import { PermissionEnum } from "src/domain/permission/domain/permission.enum";
import { formatMessage } from "src/infrastructure/util/message.util";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { UpdateTopicDto } from "./dto/update-topic.dto";

describe("TopicController (e2e)", () => {
	let app: INestApplication;
	let prismaService: PrismaService;
	let su: string;
	let gu: string;

	const createDto: CreateTopicDto = {
		name: "테스트 토픽",
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
							name: PermissionEnum.CAN_READ_BLOG,
						},
						{
							name: PermissionEnum.CAN_WRITE_BLOG,
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
		await prismaService.cleanDatabase(["Topic"]);
	});

	describe("POST - /topic", () => {
		it("주제 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/topic")
				.set("Cookie", su)
				.send(createDto);

			expect(statusCode).toEqual(201);
			expect(body.id).toBeDefined();
			expect(body.name).toEqual(createDto.name.replaceAll(" ", "_"));
			expect(body.createdAt).toBeDefined();
			expect(body.updatedAt).toBeDefined();

			return;
		});

		it("주제 중복 생성", async () => {
			await prismaService.topic.create({
				data: { name: createDto.name.replaceAll(" ", "_") },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/topic")
				.set("Cookie", su)
				.send(createDto);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(
				formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "name" }),
			);

			return;
		});

		it("권한 없이 주제 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/topic")
				.set("Cookie", gu)
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

			return;
		});
		it("로그인 없이 주제 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/topic")
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

			return;
		});
	});

	describe("PUT - /topic", () => {
		it("주제 수정", async () => {
			const updateName = "hello guys";
			const convertName = updateName.replaceAll(" ", "_");

			const { id } = await prismaService.topic.create({
				data: { name: createDto.name.replaceAll(" ", "_") },
			});

			const dto: UpdateTopicDto = {
				id,
				name: updateName,
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.put("/topic")
				.set("Cookie", su)
				.send(dto);

			expect(statusCode).toEqual(200);
			expect(body.id).toEqual(dto.id);
			expect(body.name).toEqual(convertName);

			return;
		});

		it("이미 있는 데이터로 주제 수정", async () => {
			const updateName = "hello guys";
			const convertName = updateName.replaceAll(" ", "_");

			await prismaService.topic.create({
				data: { name: convertName },
			});

			const { id } = await prismaService.topic.create({
				data: { name: "what" },
			});

			const dto: UpdateTopicDto = {
				id,
				name: updateName,
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.put("/topic")
				.set("Cookie", su)
				.send(dto);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(
				formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "name" }),
			);

			return;
		});

		it("권한 없이 주제 수정", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.put("/topic")
				.set("Cookie", gu)
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

			return;
		});

		it("로그인 없이 주제 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.put("/topic")
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

			return;
		});
	});

	describe("DELETE - /topic/:id", () => {
		it("주제 삭제", async () => {
			const { id } = await prismaService.topic.create({
				data: createDto,
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/topic/${id}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body).toEqual({});
		});

		it("존재 하지 않는 주제 삭제", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/topic/0`)
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});

		it("권한 없이 주제 삭제", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/topic/0`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /topic", () => {
		it("주제 목록 조회하기", async () => {
			const dto2: CreateTopicDto = {
				name: "테스트채팅2",
			};

			await prismaService.topic.createMany({
				data: [createDto, dto2],
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(2);
		});

		it("빈 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(0);
		});

		it("부분 검색으로 목록 조회", async () => {
			const dto2: CreateTopicDto = {
				name: "테스트채팅2",
			};

			await prismaService.topic.createMany({
				data: [createDto, dto2],
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic?page=1&take=10&orderby=name&direction=desc&like__name=2`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(1);
		});

		it("권한 없이 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /topic/:name", () => {
		it("주제 단건 조회하기", async () => {
			const { id, name } = await prismaService.topic.create({
				data: { name: createDto.name.replaceAll(" ", "_") },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic/${encodeURI(name)}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.id).toEqual(id);
			expect(body.name).toEqual(name);
		});

		it("존재 하지 않는 주제 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic/none`)
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});

		it("권한 없이 주제 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic/none`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /topic/all", () => {
		it("주제 전체 조회하기", async () => {
			const { id, name } = await prismaService.topic.create({
				data: { name: createDto.name.replaceAll(" ", "_") },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic/all`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.length).toEqual(1);
			expect(body[0].id).toEqual(id);
			expect(body[0].name).toEqual(name);
		});

		it("권한 없이 주제 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/topic/all`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});
});
