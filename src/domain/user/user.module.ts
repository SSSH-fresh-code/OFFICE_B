import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY } from './user.const';
import { InfraModule } from '../../infrastructure/infra.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './application/local.strategy';
import { LocalAuthGuard } from './application/local-auth.guard';
import { AuthController } from './presentation/auth.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [InfraModule, PassportModule],
  providers: [
    UserService,
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController, AuthController],
  exports: [UserService]
})
export class UserModule { }