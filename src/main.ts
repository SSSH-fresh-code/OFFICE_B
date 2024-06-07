import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InfraModule } from './infrastructure/infra.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './infrastructure/exception/prisma-exception.filter';
import * as session from 'express-session';
import * as passport from 'passport';
import * as SQLiteStore from 'connect-sqlite3';
import { UserService } from './domain/user/application/user.service';
import { User } from './domain/user/domain/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const userService = app.get(UserService);

  app.use(
    session({
      store: new (SQLiteStore(session))({
        db: 'sessions.sqlite', // 여기에서 SQLite 파일 경로를 설정합니다.
        dir: './', // SQLite 파일이 저장될 디렉토리를 설정합니다.
      }),
      secret: 'your_secret_key', // 적절한 비밀 키로 변경하세요
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 }, // 세션 쿠키의 유효기간 (예: 1시간)
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: User, done: (err: any, id?: any) => void) => {
    done(null, userService.serializeUser(user));
  });

  passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await userService.deserializeUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const infraModule = app.get(InfraModule);
  infraModule.configureSwagger(app);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  await app.listen(3000);
}
bootstrap();