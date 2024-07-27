import {Module} from '@nestjs/common';
import {UserService} from './application/user.service';
import {UserController} from './presentation/user.controller';
import {USER_REPOSITORY} from './user.const';
import {InfraModule} from '../../infrastructure/infra.module';
import {PrismaUserRepository} from '../../infrastructure/db/repositories/prisma-user.repository';
import {AuthService} from './application/auth/auth.service';
import {LocalStrategy} from './application/auth/local.strategy';
import {LocalAuthGuard} from './application/auth/local-auth.guard';
import {AuthController} from './presentation/auth.controller';
import {PassportModule} from '@nestjs/passport';
import {PermissionModule} from '../permission/permission.module';
import {LocalSerializer} from './application/auth/local.serializer';

@Module({
  imports: [InfraModule, PassportModule, PermissionModule],
  providers: [
    UserService,
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    LocalSerializer,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController, AuthController],
})
export class UserModule {}
