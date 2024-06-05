import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY } from './user.const';
import { InfraModule } from '../../infrastructure/infra.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [InfraModule],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController],
})
export class UserModule { }