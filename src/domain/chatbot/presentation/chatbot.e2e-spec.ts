import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Body } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../infrastructure/db/prisma.service';
import * as bcrypt from 'bcrypt';
import * as session from 'express-session';
import * as passport from 'passport';
import * as SQLiteStore from 'connect-sqlite3';
import { User } from '../../../domain/user/domain/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.cleanDatabase(['User']);
  });

  it('/users 유저 이름 업데이트 (PATCH)', async () => {
    const { id, email, password, name } = await prisma.user.create({
      data: {
        email: "test@test.com",
        password: "password",
        name: "LimC"
      }
    });

    const updateName = "LimC2";

    const response = await request(app.getHttpServer()).put('/users').send({
      id: id,
      email: "test2@test.com",
      password: "password2",
      name: "LimC2"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toEqual(id);
    expect(response.body._name).not.toEqual(name);
    expect(response.body._name).toEqual(updateName);

    return;
  });

  it('/users 유저 생성 (POST)', () => {
    return request(app.getHttpServer()).post('/users').send({
      email: "test@test.com",
      password: "password",
      name: "LimC"
    }).expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});

