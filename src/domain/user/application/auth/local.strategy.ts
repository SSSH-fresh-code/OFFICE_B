import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ReadUserDto } from "../../presentation/dto/read-user.dto";

@ApiTags("auth")
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: "email",
			passwordField: "password",
		});
	}

	@ApiOperation({ summary: "로컬 전략으로 유저 인증" })
	async validate(email: string, password: string): Promise<ReadUserDto | null> {
		const user = await this.authService.validateUser(email, password);

		return user;
	}
}
