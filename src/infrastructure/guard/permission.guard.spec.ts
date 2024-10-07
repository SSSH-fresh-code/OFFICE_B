import {
	ExecutionContext,
	ForbiddenException,
	HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { PermissionGuard } from "./permission.guard";
import { SsshException } from "../filter/exception/sssh.exception";
import { ExceptionEnum } from "../filter/exception/exception.enum";

describe("PermissionGuard", () => {
	let guard: PermissionGuard;
	let reflector: Reflector;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PermissionGuard,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn(),
					},
				},
			],
		}).compile();

		guard = module.get<PermissionGuard>(PermissionGuard);
		reflector = module.get<Reflector>(Reflector);
	});

	const mockExecutionContext = (user: any) =>
		({
			switchToHttp: () => ({
				getRequest: () => ({ user }),
			}),
			getHandler: () => jest.fn(),
			getClass: () => jest.fn(),
		}) as unknown as ExecutionContext;

	it("권한이 없는 경우 통과되어야 합니다.", () => {
		jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(null);

		const context = mockExecutionContext(null);
		expect(guard.canActivate(context)).toBe(true);
	});

	it("로그인하지 않은 경우 예외를 던져야 합니다.", () => {
		jest
			.spyOn(reflector, "getAllAndOverride")
			.mockReturnValue(["required_permission"]);

		const context = mockExecutionContext(null);
		expect(() => guard.canActivate(context)).toThrow(
			new SsshException(ExceptionEnum.NOT_LOGGED_IN, HttpStatus.FORBIDDEN),
		);
	});

	it("권한이 없는 경우 예외를 던져야 합니다.", () => {
		jest
			.spyOn(reflector, "getAllAndOverride")
			.mockReturnValue(["required_permission"]);

		const context = mockExecutionContext({ permissions: [] });
		expect(() => guard.canActivate(context)).toThrow(
			new ForbiddenException(ExceptionEnum.FORBIDDEN),
		);
	});

	it("필요한 권한이 없는 경우 예외를 던져야 합니다.", () => {
		jest
			.spyOn(reflector, "getAllAndOverride")
			.mockReturnValue(["required_permission"]);

		const context = mockExecutionContext({ permissions: ["other_permission"] });
		expect(() => guard.canActivate(context)).toThrow(
			new ForbiddenException(ExceptionEnum.FORBIDDEN),
		);
	});

	it("필요한 권한이 있는 경우 통과되어야 합니다.", () => {
		jest
			.spyOn(reflector, "getAllAndOverride")
			.mockReturnValue(["required_permission"]);

		const context = mockExecutionContext({
			permissions: ["required_permission"],
		});
		expect(guard.canActivate(context)).toBe(true);
	});
});
