import { Module } from '@nestjs/common';
import { PermissionController } from './presentation/permission.controller';
import { InfraModule } from '../../infrastructure/infra.module';
import { PrismaPermissionRepository } from '../../infrastructure/db/repositories/prisma-permission.repository';
import { PERMISSION_REPOSITORY } from './permission.const';
import { PermissionService } from './application/permission.service';

@Module({
  imports: [InfraModule],
  providers: [
    PermissionService,
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PrismaPermissionRepository,
    },
  ],
  controllers: [PermissionController],
})
export class PermissionModule { }