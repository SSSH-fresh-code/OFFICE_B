import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InfraModule } from './infrastructure/infra.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const infraModule = app.get(InfraModule);
  infraModule.configureSwagger(app);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();