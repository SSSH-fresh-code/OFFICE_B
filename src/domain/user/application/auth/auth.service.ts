import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { UserService } from "../user.service";
import { SsshException } from "../../../../infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "../../../../infrastructure/filter/exception/exception.enum";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { PermissionEnum } from "../../../../domain/permission/domain/permission.enum";
import { User } from "../../domain/user.entity";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {}

	@ApiOperation({ summary: "유저 인증" })
	async validateUser(email: string, password: string): Promise<any> {
		let user: User;

		try {
			user = await this.userService.getUserByEmailForLogin(email);
		} catch (e) {
			this.logger.verbose(e, "유저를 찾지 못하였음(로그인 과정)");
		}

		if (user) {
			const hasLoginPermission = user.permissions.includes(
				PermissionEnum.CAN_LOGIN,
			);

			if (!hasLoginPermission) {
				throw new SsshException(
					ExceptionEnum.ACCOUNT_WITHOUT_PERMISSION,
					HttpStatus.FORBIDDEN,
				);
			} else if (user.validatePassword(password)) {
				this.logger.info(`로그인 `, { email: user.email });

				return user.toDto();
			}
		}

		return null;
	}
}
