# 영업 일일 보고 시스템

영업사원이 당일 방문한 고객과 방문 내용을 기록하고, 현재 과제(Problem)와 내일 할 일(Plan)을 보고하는 일일 보고 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router)
- **API**: Hono (Next.js Route Handler)
- **ORM**: Prisma
- **DB**: PostgreSQL
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: JWT (Access Token + Refresh Token)
- **Deploy**: Google Cloud Run

## 시작하기

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npm run db:generate

# DB 마이그레이션
npm run db:migrate

# 개발 서버 실행
npm run dev
```

## 환경 변수

`.env.local.example`을 복사하여 `.env.local`을 생성하고 값을 설정하세요.
