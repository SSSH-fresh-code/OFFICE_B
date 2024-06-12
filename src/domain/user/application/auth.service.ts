import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { SsshException } from '../../../infrastructure/exception/sssh.exception';
import { ExceptionEnum } from '../../../infrastructure/exception/exception.enum';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: '유저 인증' })
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmailForLogin(email);
    if (user) {
      const hasLoginPermission = user.permissions.includes("LOGIN001");

      if (!hasLoginPermission) {
        throw new SsshException(ExceptionEnum.ACCOUNT_WITHOUT_PERMISSION, HttpStatus.UNAUTHORIZED);
      } else if (user.validatePassword(password)) {
        return user;
      }
    }

    return null;
  }
}