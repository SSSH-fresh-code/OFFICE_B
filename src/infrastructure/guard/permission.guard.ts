import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsshException } from '../filter/exception/sssh.exception';
import { ExceptionEnum } from '../filter/exception/exception.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new SsshException(ExceptionEnum.NOT_LOGGED_IN, HttpStatus.FORBIDDEN);
    } else if (!user.permissions) {
      throw new ForbiddenException(ExceptionEnum.FORBIDDEN);
    }

    const hasRole = user.permissions.some((permission: string) => requiredPermission.includes(permission));

    if (!hasRole) {
      throw new ForbiddenException(ExceptionEnum.FORBIDDEN);
    }

    return true;
  }
}