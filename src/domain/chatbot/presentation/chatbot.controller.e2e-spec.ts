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

describe("ChatBotController (e2e)", () => {
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

	describe("POST - /chat/bot", () => {
		it("챗봇 생성", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat/bot")
				.set("Cookie", su)
				.send(dto);

			expect(statusCode).toEqual(201);
			expect(body.botId).toEqual(dto.botId);
			expect(body.token).toEqual(dto.token);
			expect(body.name).toEqual(dto.name);
			expect(body.description).toEqual(dto.description);
			expect(body.type).toEqual(dto.type);

			return;
		});

		it("챗봇 중복 생성", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			await prismaService.chatBot.create({
				data: {
					...dto,
				},
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat/bot")
				.set("Cookie", su)
				.send(dto);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(
				formatMessage(ExceptionEnum.ALREADY_EXISTS, { param: "name" }),
			);

			return;
		});

		it("권한 없이 챗봇 생성", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat/bot")
				.set("Cookie", gu)
				.send(dto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);

			return;
		});
		it("로그인 없이 챗봇 생성", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat/bot")
				.send(dto);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);

			return;
		});
	});

	describe("PUT - /chat/bot", () => {
		it("챗봇을 수정합니다.", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const createdBot = await prismaService.chatBot.create({
				data: { ...dto },
			});

			const updatedDto: UpdateChatBotDto = {
				...createdBot,
				botId: "3774022ajd11kdlppa",
				token: "token2",
				name: "테스트챗봇2",
				description: "수정된 챗봇입니다.",
				type: MessengerType.DISCORD,
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.put("/chat/bot")
				.set("Cookie", su)
				.send(updatedDto);

			expect(statusCode).toEqual(200);
			expect(body.id).toEqual(createdBot.id);
			expect(body.botId).not.toEqual(createdBot.botId);
			expect(body.token).not.toEqual(createdBot.token);
			expect(body.name).not.toEqual(createdBot.name);
			expect(body.description).not.toEqual(createdBot.description);
			expect(body.type).not.toEqual(createdBot.type);
		});

		it("채팅 아이디 목록을 추가합니다.", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const createdBot = await prismaService.chatBot.create({
				data: { ...dto },
				include: { chats: true },
			});
			const createdChat = await prismaService.chat.create({
				data: {
					name: "chat",
					chatId: "chatId",
					type: MessengerType.TELEGRAM,
				},
			});

			const updatedDto: UpdateChatBotDto = {
				...createdBot,
				chatIds: [createdChat.id],
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.put("/chat/bot")
				.set("Cookie", su)
				.send(updatedDto);

			expect(statusCode).toEqual(200);
			expect(body.id).toEqual(createdBot.id);
			expect(body.chats.length).toEqual(1);
			expect(createdBot.chats.length).toEqual(0);
		});

		it("채팅 아이디 목록을 초기화 합니다.", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const createdChat = await prismaService.chat.create({
				data: {
					name: "chat",
					chatId: "chatId",
					type: MessengerType.TELEGRAM,
				},
			});

			const createdBot = await prismaService.chatBot.create({
				data: {
					...dto,
					chats: {
						connect: { id: createdChat.id },
					},
				},
				include: { chats: true },
			});

			const updatedDto: UpdateChatBotDto = {
				...createdBot,
				chatIds: [],
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.put("/chat/bot")
				.set("Cookie", su)
				.send(updatedDto);

			expect(statusCode).toEqual(200);
			expect(body.id).toEqual(createdBot.id);
			expect(body.chats.length).toEqual(0);
			expect(createdBot.chats.length).toEqual(1);
		});

		it("존재하지 않는 챗봇 수정", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const updatedDto: UpdateChatBotDto = {
				...dto,
				id: 10,
				chatIds: [],
			};

			const { statusCode, body } = await request(app.getHttpServer())
				.put("/chat/bot")
				.set("Cookie", su)
				.send(updatedDto);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});

		it("권한 없이 수정", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.put("/chat/bot")
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("DELETE - /chat/bot", () => {
		it("챗봇 삭제", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const { id } = await prismaService.chatBot.create({
				data: { ...dto },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/bot/${id}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body).toEqual({});
		});
		it("챗이 존재하는 챗봇 삭제", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const createdChat = await prismaService.chat.create({
				data: {
					name: "chat",
					chatId: "chatId",
					type: MessengerType.TELEGRAM,
				},
			});

			const { id } = await prismaService.chatBot.create({
				data: {
					...dto,
					chats: {
						connect: { id: createdChat.id },
					},
				},
				include: { chats: true },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/bot/${id}`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body).toEqual({});
		});

		it("존재 하지 않는 챗봇 삭제", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/bot/0`)
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});
		it("권한 없이 챗봇 삭제", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.delete(`/chat/bot/0`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /chat/bot", () => {
		it("챗봇 목록 조회하기", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};
			const dto2: CreateChatBotDto = {
				botId: "19091fda019z92381a",
				token: "token2",
				name: "테스트챗봇2",
				description: "테스트용2 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			await prismaService.chatBot.createMany({
				data: [{ ...dto }, { ...dto2 }],
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat/bot?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(2);
		});

		it("챗봇 목록 조회하기 - type으로 조회", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};
			const dto2: CreateChatBotDto = {
				botId: "19091fda019z92381a",
				token: "token2",
				name: "테스트챗봇2",
				description: "테스트용2 챗봇입니다.",
				type: MessengerType.DISCORD,
			};

			await prismaService.chatBot.createMany({
				data: [{ ...dto }, { ...dto2 }],
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(
					`/chat/bot?page=1&take=10&orderby=name&direction=desc&where__type=DISCORD`,
				)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(1);
		});

		it("빈 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat/bot?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", su);

			expect(statusCode).toEqual(200);
			expect(body.data.length).toEqual(0);
		});

		it("권한 없이 목록 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat/bot?page=1&take=10&orderby=name&direction=desc`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("GET - /chat/bot/:id", () => {
		it("챗봇 조회", async () => {
			const dto: CreateChatBotDto = {
				botId: "19091fda019z92380p",
				token: "token",
				name: "테스트챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const createdChatBot = await prismaService.chatBot.create({
				data: dto,
				include: { chats: true },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat/bot/${createdChatBot.id}`)
				.set("Cookie", su);

			body.createdAt = new Date(body.createdAt);
			body.updatedAt = new Date(body.updatedAt);

			expect(statusCode).toEqual(200);
			expect(body).toEqual(createdChatBot);
		});

		it("없는 챗봇 아이디 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat/bot/0`)
				.set("Cookie", su);

			expect(statusCode).toEqual(400);
			expect(body.message).toEqual(ExceptionEnum.NOT_FOUND);
		});

		it("권한 없이 챗봇 조회", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.get(`/chat/bot/0`)
				.set("Cookie", gu);

			expect(statusCode).toEqual(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});
	});

	describe("POST - /chat/bot/send", () => {
		it("Telegram 메세지 전송", async () => {
			const dto: CreateChatBotDto = {
				botId: "6431728868:AAEX9arBErceKy2e5HfmGTpgXXVZPtho3gs",
				token: "6431728868:AAEX9arBErceKy2e5HfmGTpgXXVZPtho3gs",
				name: "테스트 챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.TELEGRAM,
			};

			const createdChat = await prismaService.chat.create({
				data: {
					name: "테스트 챗봇",
					chatId: "7370566612",
					type: MessengerType.TELEGRAM,
				},
			});

			const bot = await prismaService.chatBot.create({
				data: {
					...dto,
					chats: {
						connect: { id: createdChat.id },
					},
				},
				include: { chats: true },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat/bot/send")
				.set("Cookie", su)
				.send({
					botId: bot.id,
					chatId: bot.chats[0].id,
					message: "TELEGRAM 테스트 메세지 입니다.",
				});

			expect(statusCode).toBe(201);
			expect(body.isSuccess).toBeTruthy();
		});

		it("Discrod 메세지 전송", async () => {
			const dto: CreateChatBotDto = {
				botId:
					"QZVUrXbCwhiZBVM6yoi_3lHqOl83CsWuHSZjU7APelJxJpufBFcpkwS6pAPlKerIYErN",
				token: "1293778385260122212",
				name: "테스트 챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.DISCORD,
			};

			const createdChat = await prismaService.chat.create({
				data: {
					name: "테스트-알람",
					chatId: "1",
					type: MessengerType.DISCORD,
				},
			});

			const bot = await prismaService.chatBot.create({
				data: {
					...dto,
					chats: {
						connect: { id: createdChat.id },
					},
				},
				include: { chats: true },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.post("/chat/bot/send")
				.set("Cookie", su)
				.send({
					botId: bot.id,
					chatId: bot.chats[0].id,
					message: "DISCORD 테스트 메세지 입니다.",
				});

			expect(statusCode).toBe(201);
			expect(body.isSuccess).toBeTruthy();
		});

		it("구현되지 않은 메신저에 메세지 전송", async () => {
			const dto: CreateChatBotDto = {
				botId: "6431728868:AAEX9arBErceKy2e5HfmGTpgXXVZPtho3gs",
				token: "6431728868:AAEX9arBErceKy2e5HfmGTpgXXVZPtho3gs",
				name: "테스트 챗봇",
				description: "테스트용 챗봇입니다.",
				type: MessengerType.SLACK,
			};

			const createdChat = await prismaService.chat.create({
				data: {
					name: "테스트 챗봇",
					chatId: "7370566612",
					type: MessengerType.SLACK,
				},
			});

			const bot = await prismaService.chatBot.create({
				data: {
					...dto,
					chats: {
						connect: { id: createdChat.id },
					},
				},
				include: { chats: true },
			});

			const { statusCode, body } = await request(app.getHttpServer())
				.post(`/chat/bot/send`)
				.set("Cookie", su)
				.send({
					botId: bot.id,
					chatId: bot.chats[0].id,
					message: "테스트 메세지 입니다.",
				});

			expect(statusCode).toBe(501);
			expect(body.message).toEqual(ExceptionEnum.NOT_IMPLEMENTED);
		});

		it("권한 없이 메세지 전송", async () => {
			const { statusCode, body } = await request(app.getHttpServer())
				.post(`/chat/bot/send`)
				.set("Cookie", gu);

			expect(statusCode).toBe(403);
			expect(body.message).toEqual(ExceptionEnum.FORBIDDEN);
		});

		it("로그인 하지않고 메세지 전송", async () => {
			const { statusCode, body } = await request(app.getHttpServer()).post(
				`/chat/bot/send`,
			);

			expect(statusCode).toBe(403);
			expect(body.message).toEqual(ExceptionEnum.NOT_LOGGED_IN);
		});
	});
});
