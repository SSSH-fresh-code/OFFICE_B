import { Module } from '@nestjs/common';
import { PrismaModule } from './db/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PagingService } from './common/services/paging.service';
import { PrismaService } from './db/prisma.service';
import { PermissionGuard } from './guard/permission.guard';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    PagingService,
    PrismaService,
  ],
  exports: [PrismaModule, ConfigModule, PagingService, PrismaService],
})
export class InfraModule {
  async configureSwagger(app: any) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
}