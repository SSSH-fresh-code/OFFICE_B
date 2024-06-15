import { permission } from 'process';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsshException } from '../filter/exception/sssh.exception';
import { ExceptionEnum } from '../filter/exception/exception.enum';
import { PermissionEnum } from 'src/domain/permission/domain/permission.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissionInClass = this.reflector.getAllAndOverride<string[]>('permissions-class', [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    const requiredPermissionInMethod = this.reflector.getAllAndOverride<string[]>('permissions-method', [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];

    const requiredPermission = [...requiredPermissionInClass, ...requiredPermissionInMethod]

    if (!requiredPermission.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new SsshException(ExceptionEnum.NOT_LOGGED_IN, HttpStatus.FORBIDDEN);
    } else if (!user.permissions) {
      throw new ForbiddenException(ExceptionEnum.FORBIDDEN);
    } else if (user.permissions.includes(PermissionEnum.SUPER_USER)) {
      return true;
    }

    const hasRole = user.permissions.some((permission: string) => requiredPermission.includes(permission));

    if (!hasRole) {
      throw new ForbiddenException(ExceptionEnum.FORBIDDEN);
    }

    return true;
  }
}