# 싱싱상회 백오피스 애플리케이션

## 개요
싱싱상회 백오피스 애플리케이션은 싱싱상회 서비스의 내부 운영을 지원하는 관리 시스템입니다. 사용자 관리, 블로그 관리, 챗봇 관리, 권한 관리 등의 기능을 포함하고 있으며, 효율적인 운영과 관리를 목표로 합니다.

## 기술 스택
- **프레임워크**: Nest.js
- **ORM**: Prisma
- **데이터베이스**: PostgreSQL, SQLite (테스트용)
- **언어**: TypeScript
- **테스트**: Jest, E2E 테스트
- **문서화**: Swagger/OpenAPI
- **컨테이너화**: Docker
- **CI/CD**: GitHub Actions

## 주요 기능
- **사용자 관리**: 사용자 CRUD, 권한 관리
- **블로그 관리**: 포스트, 주제, 시리즈 관리
- **챗봇 관리**: 메신저 봇 설정, 채팅 로그 관리
- **권한 관리**: 세분화된 권한 시스템
- **API 문서화**: Swagger를 통한 자동 문서화

## 시작하기

### 필수 요구사항
- Node.js 18.x 이상
- PostgreSQL 13.x 이상
- Docker (선택사항)

### 설치 및 실행
1. 저장소 클론
```bash
git clone https://github.com/your-username/singsing-backoffice.git
cd singsing-backoffice
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 설정하세요:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/mydatabase
JWT_SECRET=your-secret-key
PORT=3000
```

4. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
```

5. 개발 서버 실행
```bash
npm run start:dev
```

### Docker를 통한 실행
```bash
docker build -t singsing-backoffice -f ./env/Dockerfile .
docker run -p 3000:3000 singsing-backoffice
```

## 프로젝트 구조
```
src/
├── domain/                 # 도메인 레이어
│   ├── user/              # 사용자 관련 모듈
│   ├── blog/              # 블로그 관련 모듈
│   ├── chatbot/           # 챗봇 관련 모듈
│   └── permission/        # 권한 관련 모듈
├── infrastructure/        # 인프라스트럭처 레이어
│   ├── common/            # 공통 유틸리티
│   ├── db/               # 데이터베이스 관련
│   └── decorator/        # 커스텀 데코레이터
└── main.ts               # 애플리케이션 엔트리포인트
```

## 테스트
```bash
# 단위 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 보고서 생성
npm run test:cov
```

## API 문서
서버 실행 후 `http://localhost:3000/api-docs`에서 Swagger 문서를 확인할 수 있습니다.

## 배포
GitHub Actions를 통해 자동 배포가 구성되어 있습니다. main 브랜치에 push하거나 PR이 머지되면 자동으로 배포가 진행됩니다.

### CI/CD 파이프라인
```yaml
name: Backend Deployment

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          docker build -t app .
          docker push app
```

## 기여하기
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스
이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.
