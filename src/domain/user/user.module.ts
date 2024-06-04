import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infrastructure/repositories/prisma-user.repository';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController],
})
export class UserModule { }