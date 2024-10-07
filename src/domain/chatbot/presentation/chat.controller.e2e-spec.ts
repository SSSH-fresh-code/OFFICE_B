import * as request from "supertest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/db/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../app.module";
import * as session from "express-session";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { PrismaClientExceptionFilter } from "../../../infrastructure/filter/exception/prisma-exception.filter";
import { PermissionEnum } from "../../../domain/permission/domain/permission.enum";
import { CreateChatBotDto } from "./dto/create-chatbot.dto";
import { MessengerType } from "../domain/chatbot.entity";
import { formatMessage } from "../../../infrastructure/util/message.util";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { UpdateChatBotDto } from "./dto/update-chatbot.dto";
import { CreateChatDto } from "./dto/create-chat.dto";

describe("ChatController (e2e)", () => {
	let app: INestApplication;
	let prismaService: PrismaService;
	let su: string;
	let gu: string;

	const createDto: CreateChatDto = {
		chatId: "19091fda019z92380p",
		name: "테스트챗봇",
		type: MessengerType.TELEGRAM,
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
							name: PermissionEnum.CAN_READ_CHAT,
						},
						{
							name: PermissionEnum.CAN_WRITE_CHAT,
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
		await prismaService.cleanDatabase(["Chat", "ChatBot"]);
	});

	describe("POST - /chat", () => {
		it("채팅 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat")
				.set("Cookie", su)
				.send(createDto);

			expect(statusCode).toEqual(201);
			expect(body.chatId).toEqual(createDto.chatId);
			expect(body.name).toEqual(createDto.name);
			expect(body.type).toEqual(createDto.type);

			return;
		});

		it("채팅 중복 생성", async () => {
			await prismaService.chat.create({
				data: createDto,
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat")
				.set("Cookie", su)
				.send(createDto);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(
				formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "name" }),
			);

			return;
		});

		it("권한 없이 채팅 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat")
				.set("Cookie", gu)
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

			return;
		});
		it("로그인 없이 채팅 생성", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat")
				.send(createDto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

			return;
		});
	});

	describe("DELETE - /chat", () => {
		it("챗봇 삭제", async () => {
			const { id } = await prismaService.chat.create({
				data: createDto,
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/${id}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body).toEqual({});
		});

		it("챗봇에 속해있는 채팅 삭제", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const { id } = await prismaService.chat.create({
				data: createDto,
			});

			await prismaService.chatBot.create({
				data: {
					...dto,
					chats: {
						connect: { id },
					},
				},
				include: { chats: true },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/${id}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body).toEqual({});
		});

		it("존재 하지 않는 채팅 삭제", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/0`)
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});
		it("권한 없이 채팅 삭제", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/0`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /chat/bot", () => {
		it("채팅 목록 조회하기", async () => {
			const dto2: CreateChatDto = {
				chatId: "19091fda019z92381a",
				name: "테스트채팅2",
				type: MessengerType.TELEGRAM,
			};

			await prismaService.chat.createMany({
				data: [createDto, dto2],
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(
					`/chat?page=1&take=10&orderby=name&direction=desc&where__type=TELEGRAM`,
				)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(2);
		});

		it("빈 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(
					`/chat?page=1&take=10&orderby=name&direction=desc&where__type=TELEGRAM`,
				)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(0);
		});

		it("타입 없이 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(
				formatMessage(ExceptionEnum.PARAMETER_NOT_FOUND, { param: "type" }),
			);
		});

		it("권한 없이 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(
					`/chat?page=1&take=10&orderby=name&direction=desc&where__type=TELEGRAM`,
				)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});
});
