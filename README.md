# 싱싱상회 백오피스 애플리케이션

## 개요
싱싱상회 백오피스 애플리케이션은 싱싱상회 서비스의 내부 운영을 지원하는 관리 시스템입니다. 사용자 관리, 블로그 관리, 메뉴 관리, 권한 관리, 업무 관리, 알람 관리 등의 기능을 포함하고 있으며, 효율적인 운영과 관리를 목표로 합니다.

## 기술 구성
- **프레임워크**: Nest.js
- **ORM**: Prisma
- **데이터베이스**: PostgreSQL
- **언어**: TypeScript
- **테스트**: Jest

## 환경 변수 파일 예시
다음은 프로젝트에서 사용하는 환경 변수 파일(.env)의 예시입니다:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/mydatabase
JWT_SECRET=mysecretkey
PORT=3000
```

## 아키텍처
프로젝트는 도메인 주도 설계(DDD) 원칙을 따르며, 각 기능은 독립된 모듈로 구성되어 있습니다. 주요 구성 요소는 다음과 같습니다:

- **User Module**: 사용자 관리
- **Blog Module**: 블로그 포스트, 주제, 시리즈 관리
- **Menu Module**: 메뉴 관리
- **Permission Module**: 권한 관리
- **Task Module**: 업무 관리
- **Notification Module**: 알람 관리

모든 모듈은 도메인 레이어, 애플리케이션 레이어, 인프라스트럭처 레이어로 나누어져 있어, 코드의 응집도와 유지보수성을 높였습니다.