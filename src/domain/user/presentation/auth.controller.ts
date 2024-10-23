import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "../application/auth/auth.service";
import { Request, Response } from "express";
import { LocalAuthGuard } from "../application/auth/local-auth.guard";
@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@UseGuards(LocalAuthGuard)
	@ApiOperation({ summary: "로그인" })
	@ApiBody({
		schema: {
			properties: { email: { type: "string" }, password: { type: "string" } },
		},
	})
	@ApiResponse({ status: 200, description: "로그인 성공" })
	@ApiResponse({ status: 401, description: "인증 실패" })
	async login(@Req() req: Request, @Res() res: Response) {
		if (req.user.email === process.env.LOG_MANAGER_EMAIL) {
			req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24시간
		}
		res.send({ user: req.user });
	}

	@Post("logout")
	@ApiOperation({ summary: "로그아웃" })
	@ApiResponse({ status: 200, description: "로그아웃 성공" })
	@ApiResponse({ status: 500, description: "로그아웃 실패" })
	async logout(@Req() req: Request, @Res() res: Response) {
		req.session.destroy((err) => {
			if (err) {
				res.status(500).send({ message: "로그아웃 실패" });
			} else {
				res.send({ message: "로그아웃 성공" });
			}
		});
	}
}
