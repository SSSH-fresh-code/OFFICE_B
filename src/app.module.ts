import { Module } from '@nestjs/common';
import { InfraModule } from './infrastructure/infra.module';
import { UserModule } from './domain/user/user.module';

@Module({
  imports: [InfraModule, UserModule],
})
export class AppModule { }