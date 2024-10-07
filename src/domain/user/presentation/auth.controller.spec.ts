import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../application/auth/auth.service";
import { UserService } from "../application/user.service";
import { LocalAuthGuard } from "../application/auth/local-auth.guard";
import { Request, Response } from "express";
import { User } from "../domain/user.entity";

/**
 * Mock Auth Service
 * 인증 서비스의 Mock 함수들을 정의합니다.
 */
const mockAuthService = () => ({
	validateUser: jest.fn(),
});

/**
 * Mock User Service
 * 유저 서비스의 Mock 함수들을 정의합니다.
 */
const mockUserService = () => ({
	serializeUser: jest.fn(),
	deserializeUser: jest.fn(),
});

describe("AuthController", () => {
	let authController: AuthController;
	let authService;
	let userService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useFactory: mockAuthService,
				},
				{
					provide: UserService,
					useFactory: mockUserService,
				},
				LocalAuthGuard,
			],
		}).compile();

		authController = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		userService = module.get<UserService>(UserService);
	});

	describe("login", () => {
		it("로그인을 성공적으로 수행해야 합니다.", async () => {
			const req = {
				body: { email: "1@1.com", password: "password" },
			} as Request;
			const res = { send: jest.fn() } as unknown as Response;

			await authController.login(req, res);
			expect(res.send).toHaveBeenCalledWith({ user: undefined });
		});
	});

	describe("logout", () => {
		it("로그아웃을 성공적으로 수행해야 합니다.", async () => {
			const req = {
				session: {
					destroy: jest.fn((callback) => callback(null)),
				},
			} as unknown as Request;
			const res = { send: jest.fn() } as unknown as Response;

			await authController.logout(req, res);
			expect(res.send).toHaveBeenCalledWith({ message: "로그아웃 성공" });
		});

		it("로그아웃 실패 시 에러를 던져야 합니다.", async () => {
			const req = {
				session: {
					destroy: jest.fn((callback) => callback(new Error("로그아웃 실패"))),
				},
			} as unknown as Request;
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			} as unknown as Response;

			await authController.logout(req, res);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith({ message: "로그아웃 실패" });
		});
	});
});
