import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InfraModule } from './infrastructure/infra.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './infrastructure/exception/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const infraModule = app.get(InfraModule);
  infraModule.configureSwagger(app);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  await app.listen(3000);
}
bootstrap();