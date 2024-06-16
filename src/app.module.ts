import { Module } from '@nestjs/common';
import { InfraModule } from './infrastructure/infra.module';
import { UserModule } from './domain/user/user.module';
import { PermissionModule } from './domain/permission/permission.module';

@Module({
  imports: [InfraModule, UserModule, PermissionModule],
})
export class AppModule { }