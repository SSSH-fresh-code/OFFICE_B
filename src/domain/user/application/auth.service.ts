import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { SsshException } from '../../../infrastructure/filter/exception/sssh.exception';
import { ExceptionEnum } from '../../../infrastructure/filter/exception/exception.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

  @ApiOperation({ summary: '유저 인증' })
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmailForLogin(email);
    if (user) {
      const hasLoginPermission = user.permissions.includes("LOGIN001");

      if (!hasLoginPermission) {
        throw new SsshException(ExceptionEnum.ACCOUNT_WITHOUT_PERMISSION, HttpStatus.UNAUTHORIZED);
      } else if (user.validatePassword(password)) {
        this.logger.info(`로그인 `, { email: user.email });

        return user;
      }
    }

    return null;
  }
}