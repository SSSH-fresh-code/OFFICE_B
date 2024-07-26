# Stage 1: Build
FROM node:18-alpine AS builder

# pnpm 설치
RUN npm install -g pnpm

# 애플리케이션 디렉토리 생성
WORKDIR /usr/src/app

# package.json과 pnpm-lock.yaml 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install

# 소스 복사 및 빌드
COPY . .
RUN pnpm run build

# Stage 2: Run
FROM node:18-alpine

# pnpm 및 pm2 설치
RUN npm install -g pnpm pm2 prisma@5.15.1

# 애플리케이션 디렉토리 생성
WORKDIR /usr/src/app

# 빌드된 파일과 .env 파일 복사
COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/prisma/schema.prisma ./prisma/

# 의존성 설치
RUN pnpm install --prod

# pm2 설정 파일 복사
COPY ecosystem.config.js ./

# 애플리케이션 실행
CMD ["pnpm", "run", "prisma:generate"]

