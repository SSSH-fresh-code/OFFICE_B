import { Injectable, ExecutionContext, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExceptionEnum } from '../../../../infrastructure/filter/exception/exception.enum';
import { SsshException } from '../../../../infrastructure/filter/exception/sssh.exception';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new SsshException(ExceptionEnum.LOGIN_FAILED, HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
