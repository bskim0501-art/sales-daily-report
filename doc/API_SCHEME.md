# 영업 일일 보고 시스템 — API 명세서

---

## 목차

1. [공통 사항](#1-공통-사항)
2. [인증 API](#2-인증-api)
3. [보고서 API](#3-보고서-api)
4. [방문 내역 API](#4-방문-내역-api)
5. [과제·상담 API](#5-과제상담-api)
6. [내일 할 일 API](#6-내일-할-일-api)
7. [댓글 API](#7-댓글-api)
8. [고객 마스터 API](#8-고객-마스터-api)
9. [영업사원 마스터 API](#9-영업사원-마스터-api)
10. [에러 코드 목록](#10-에러-코드-목록)

---

## 1. 공통 사항

### 1.1 Base URL

```
https://api.example.com/v1
```

### 1.2 인증 방식

모든 API(로그인 제외)는 요청 헤더에 JWT Bearer 토큰을 포함해야 합니다.

```http
Authorization: Bearer {access_token}
```

### 1.3 요청/응답 형식

```
Content-Type: application/json
Accept: application/json
```

### 1.4 공통 응답 구조

**성공**

```json
{
  "success": true,
  "data": { ... }
}
```

**목록 조회 (페이지네이션)**

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total_count": 143,
      "total_pages": 8
    }
  }
}
```

**실패**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "report_date", "message": "보고 날짜는 필수입니다." }
    ]
  }
}
```

### 1.5 공통 쿼리 파라미터 (목록 API)

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | integer | 1 | 페이지 번호 (1-based) |
| `size` | integer | 20 | 페이지당 건수 (최대 100) |

### 1.6 권한 규칙

| 역할 | 설명 |
|------|------|
| `SALESPERSON` | 본인 데이터만 작성·조회 가능 |
| `MANAGER` | 전체 데이터 조회, 댓글 작성, 상태 변경, 마스터 관리 가능 |

---

## 2. 인증 API

### 2.1 로그인

```
POST /auth/login
```

**권한**: 없음 (공개)

**Request Body**

```json
{
  "credential": "EMP-001",
  "password": "P@ssw0rd!"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `credential` | string | ✅ | 사번 또는 이메일 |
| `password` | string | ✅ | 비밀번호 |

**Response 200**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 28800,
    "user": {
      "id": 1,
      "employee_no": "EMP-001",
      "name": "홍길동",
      "role": "SALESPERSON"
    }
  }
}
```

**Response 401** — 자격증명 불일치

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "사번/이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

---

### 2.2 로그아웃

```
POST /auth/logout
```

**권한**: 로그인 사용자

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

### 2.3 토큰 갱신

```
POST /auth/refresh
```

**권한**: 없음 (Refresh Token 사용)

**Request Body**

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 28800
  }
}
```

---

## 3. 보고서 API

### 3.1 보고서 목록 조회

```
GET /reports
```

**권한**: `SALESPERSON` (본인), `MANAGER` (전체)

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `salesperson_id` | integer | - | 영업사원 ID 필터 (MANAGER만 사용 가능) |
| `date_from` | date | - | 조회 시작일 (YYYY-MM-DD) |
| `date_to` | date | - | 조회 종료일 (YYYY-MM-DD) |
| `status` | string | - | `draft` / `submitted` / `confirmed` |
| `page` | integer | - | 기본값: 1 |
| `size` | integer | - | 기본값: 20 |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 42,
        "report_date": "2025-05-09",
        "status": "submitted",
        "salesperson": {
          "id": 1,
          "name": "홍길동",
          "department": "영업1팀"
        },
        "visit_count": 3,
        "created_at": "2025-05-09T09:00:00Z",
        "updated_at": "2025-05-09T18:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total_count": 45,
      "total_pages": 3
    }
  }
}
```

---

### 3.2 보고서 상세 조회

```
GET /reports/:id
```

**권한**: `SALESPERSON` (본인), `MANAGER` (전체)

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | integer | 보고서 ID |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "report_date": "2025-05-09",
    "status": "submitted",
    "salesperson": {
      "id": 1,
      "name": "홍길동",
      "department": "영업1팀"
    },
    "visit_records": [
      {
        "id": 101,
        "sort_order": 1,
        "customer": {
          "id": 10,
          "customer_code": "C-0001",
          "company_name": "삼성전자 (주)"
        },
        "visit_content": "신제품 데모 진행 및 기술 질의 대응",
        "visit_result": "2차 미팅 일정 조율 예정",
        "created_at": "2025-05-09T09:10:00Z"
      }
    ],
    "problems": [
      {
        "id": 201,
        "sort_order": 1,
        "content": "삼성전자 단가 협의 필요 — 경쟁사 대비 15% 이상 차이",
        "category": "가격",
        "comments": [
          {
            "id": 301,
            "content": "영업본부와 협의 후 특별 단가 적용 검토하겠습니다.",
            "author": { "id": 5, "name": "김팀장" },
            "created_at": "2025-05-09T19:12:00Z"
          }
        ],
        "created_at": "2025-05-09T09:10:00Z",
        "updated_at": "2025-05-09T09:10:00Z"
      }
    ],
    "plans": [
      {
        "id": 401,
        "sort_order": 1,
        "content": "삼성전자 2차 미팅 일정 확정 메일 발송",
        "priority": "high",
        "comments": [],
        "created_at": "2025-05-09T09:10:00Z",
        "updated_at": "2025-05-09T09:10:00Z"
      }
    ],
    "created_at": "2025-05-09T09:00:00Z",
    "updated_at": "2025-05-09T18:30:00Z"
  }
}
```

**Response 403** — 타인 보고서 접근 시 (SALESPERSON)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "본인의 보고서만 조회할 수 있습니다."
  }
}
```

---

### 3.3 보고서 생성 (임시저장)

```
POST /reports
```

**권한**: `SALESPERSON`

**Request Body**

```json
{
  "report_date": "2025-05-10",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "신제품 데모 진행",
      "visit_result": "긍정적 반응",
      "sort_order": 1
    }
  ],
  "problems": [
    {
      "content": "단가 협의 필요",
      "category": "가격",
      "sort_order": 1
    }
  ],
  "plans": [
    {
      "content": "2차 미팅 일정 확정 메일 발송",
      "priority": "high",
      "sort_order": 1
    }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `report_date` | date | ✅ | 보고 날짜, 미래 날짜 불가 |
| `visit_records` | array | ✅ | 방문 내역 (최소 1건) |
| `visit_records[].customer_id` | integer | ✅ | 고객 마스터 ID |
| `visit_records[].visit_content` | string | ✅ | 방문 내용 (최대 500자) |
| `visit_records[].visit_result` | string | - | 방문 결과 (최대 200자) |
| `visit_records[].sort_order` | integer | ✅ | 표시 순서 |
| `problems` | array | - | 과제·상담 목록 |
| `problems[].content` | string | ✅ | 내용 (최대 500자) |
| `problems[].category` | string | - | `가격` / `납기` / `기술` / `경쟁사` / `기타` |
| `problems[].sort_order` | integer | ✅ | 표시 순서 |
| `plans` | array | - | 내일 할 일 목록 |
| `plans[].content` | string | ✅ | 내용 (최대 500자) |
| `plans[].priority` | string | - | `high` / `medium` / `low` (기본: `medium`) |
| `plans[].sort_order` | integer | ✅ | 표시 순서 |

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 43,
    "report_date": "2025-05-10",
    "status": "draft",
    "created_at": "2025-05-10T09:00:00Z",
    "updated_at": "2025-05-10T09:00:00Z"
  }
}
```

**Response 409** — 같은 날짜 보고서 중복

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "해당 날짜에 이미 보고서가 존재합니다.",
    "details": { "existing_report_id": 42 }
  }
}
```

---

### 3.4 보고서 수정

```
PUT /reports/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | integer | 보고서 ID |

**Request Body**

3.3과 동일한 구조. `report_date`는 변경 불가.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 43,
    "report_date": "2025-05-10",
    "status": "draft",
    "updated_at": "2025-05-10T10:00:00Z"
  }
}
```

**Response 422** — 제출 완료 상태에서 수정 시도

```json
{
  "success": false,
  "error": {
    "code": "IMMUTABLE_STATUS",
    "message": "제출 완료된 보고서는 수정할 수 없습니다."
  }
}
```

---

### 3.5 보고서 제출

```
PATCH /reports/:id/submit
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | integer | 보고서 ID |

**Request Body**: 없음

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 43,
    "status": "submitted",
    "updated_at": "2025-05-10T18:00:00Z"
  }
}
```

---

### 3.6 보고서 확인 처리

```
PATCH /reports/:id/confirm
```

**권한**: `MANAGER`

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | integer | 보고서 ID |

**Request Body**: 없음

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 43,
    "status": "confirmed",
    "updated_at": "2025-05-10T19:00:00Z"
  }
}
```

**Response 422** — submitted 상태가 아닌 경우

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "제출 완료 상태의 보고서만 확인 처리할 수 있습니다."
  }
}
```

---

## 4. 방문 내역 API

> 보고서 생성(POST /reports) 및 수정(PUT /reports/:id)에 방문 내역이 포함되어 일괄 처리되는 것을 원칙으로 합니다.  
> 아래 API는 특정 행만 단독으로 추가·수정·삭제할 때 사용합니다.

### 4.1 방문 내역 추가

```
POST /reports/:report_id/visit-records
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Request Body**

```json
{
  "customer_id": 11,
  "visit_content": "계약 갱신 협의",
  "visit_result": "내주 계약서 발송 예정",
  "sort_order": 2
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 102,
    "customer_id": 11,
    "visit_content": "계약 갱신 협의",
    "visit_result": "내주 계약서 발송 예정",
    "sort_order": 2,
    "created_at": "2025-05-10T10:30:00Z"
  }
}
```

---

### 4.2 방문 내역 수정

```
PUT /reports/:report_id/visit-records/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Request Body**

```json
{
  "customer_id": 11,
  "visit_content": "계약 갱신 협의 (수정)",
  "visit_result": "이번 주 내 계약서 발송",
  "sort_order": 2
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 102,
    "customer_id": 11,
    "visit_content": "계약 갱신 협의 (수정)",
    "visit_result": "이번 주 내 계약서 발송",
    "sort_order": 2,
    "updated_at": "2025-05-10T11:00:00Z"
  }
}
```

---

### 4.3 방문 내역 삭제

```
DELETE /reports/:report_id/visit-records/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**비즈니스 규칙**: 방문 내역이 1건만 남은 경우 삭제 불가

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

**Response 422** — 마지막 1건 삭제 시도

```json
{
  "success": false,
  "error": {
    "code": "MIN_VISIT_RECORD",
    "message": "방문 내역은 최소 1건 이상 필요합니다."
  }
}
```

---

## 5. 과제·상담 API

### 5.1 과제·상담 추가

```
POST /reports/:report_id/problems
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Request Body**

```json
{
  "content": "납기 지연 리스크 발생",
  "category": "납기",
  "sort_order": 2
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 202,
    "content": "납기 지연 리스크 발생",
    "category": "납기",
    "sort_order": 2,
    "created_at": "2025-05-10T10:00:00Z",
    "updated_at": "2025-05-10T10:00:00Z"
  }
}
```

---

### 5.2 과제·상담 수정

```
PUT /reports/:report_id/problems/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Request Body**

```json
{
  "content": "납기 지연 리스크 발생 — 공급사 확인 필요",
  "category": "납기",
  "sort_order": 2
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 202,
    "content": "납기 지연 리스크 발생 — 공급사 확인 필요",
    "category": "납기",
    "sort_order": 2,
    "updated_at": "2025-05-10T10:30:00Z"
  }
}
```

---

### 5.3 과제·상담 삭제

```
DELETE /reports/:report_id/problems/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

## 6. 내일 할 일 API

### 6.1 내일 할 일 추가

```
POST /reports/:report_id/plans
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Request Body**

```json
{
  "content": "LG화학 계약서 초안 작성",
  "priority": "medium",
  "sort_order": 2
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 402,
    "content": "LG화학 계약서 초안 작성",
    "priority": "medium",
    "sort_order": 2,
    "created_at": "2025-05-10T10:00:00Z",
    "updated_at": "2025-05-10T10:00:00Z"
  }
}
```

---

### 6.2 내일 할 일 수정

```
PUT /reports/:report_id/plans/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Request Body**

```json
{
  "content": "LG화학 계약서 초안 작성 및 법무팀 검토 요청",
  "priority": "high",
  "sort_order": 2
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 402,
    "content": "LG화학 계약서 초안 작성 및 법무팀 검토 요청",
    "priority": "high",
    "sort_order": 2,
    "updated_at": "2025-05-10T10:30:00Z"
  }
}
```

---

### 6.3 내일 할 일 삭제

```
DELETE /reports/:report_id/plans/:id
```

**권한**: `SALESPERSON` (본인, status=draft만 가능)

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

## 7. 댓글 API

### 7.1 댓글 등록 (Problem)

```
POST /problems/:problem_id/comments
```

**권한**: `MANAGER`

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `problem_id` | integer | 과제·상담 ID |

**Request Body**

```json
{
  "content": "영업본부와 협의 후 특별 단가 적용 검토하겠습니다."
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `content` | string | ✅ | 댓글 내용 (최대 300자) |

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 301,
    "target_type": "PROBLEM",
    "target_id": 201,
    "content": "영업본부와 협의 후 특별 단가 적용 검토하겠습니다.",
    "author": {
      "id": 5,
      "name": "김팀장"
    },
    "created_at": "2025-05-09T19:12:00Z",
    "updated_at": "2025-05-09T19:12:00Z"
  }
}
```

---

### 7.2 댓글 등록 (Plan)

```
POST /plans/:plan_id/comments
```

**권한**: `MANAGER`

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `plan_id` | integer | 내일 할 일 ID |

**Request Body / Response**: 7.1과 동일 구조 (`target_type: "PLAN"`)

---

### 7.3 댓글 수정

```
PUT /comments/:id
```

**권한**: `MANAGER` (본인 작성 댓글만)

**Request Body**

```json
{
  "content": "내일 오전 중으로 영업본부에 확인 요청하겠습니다."
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 301,
    "content": "내일 오전 중으로 영업본부에 확인 요청하겠습니다.",
    "updated_at": "2025-05-09T20:00:00Z"
  }
}
```

---

### 7.4 댓글 삭제

```
DELETE /comments/:id
```

**권한**: `MANAGER` (본인 작성 댓글만)

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

## 8. 고객 마스터 API

### 8.1 고객 목록 조회

```
GET /customers
```

**권한**: `SALESPERSON`, `MANAGER`

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `keyword` | string | - | 고객사명 부분 검색 |
| `industry` | string | - | 업종 필터 |
| `grade` | string | - | 등급 필터 (`VIP` / `A` / `B` / `C`) |
| `is_active` | boolean | - | 활성 여부 (기본: `true`) |
| `page` | integer | - | 기본값: 1 |
| `size` | integer | - | 기본값: 20 |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "customer_code": "C-0001",
        "company_name": "삼성전자 (주)",
        "contact_name": "이대리",
        "phone": "02-1234-5678",
        "industry": "전자",
        "grade": "A",
        "is_active": true,
        "created_at": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total_count": 87,
      "total_pages": 5
    }
  }
}
```

---

### 8.2 고객 상세 조회

```
GET /customers/:id
```

**권한**: `SALESPERSON`, `MANAGER`

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "customer_code": "C-0001",
    "company_name": "삼성전자 (주)",
    "contact_name": "이대리",
    "phone": "02-1234-5678",
    "address": "경기도 수원시 영통구 삼성로 129",
    "industry": "전자",
    "grade": "A",
    "is_active": true,
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2025-03-10T00:00:00Z"
  }
}
```

---

### 8.3 고객 등록

```
POST /customers
```

**권한**: `MANAGER`

**Request Body**

```json
{
  "customer_code": "C-0010",
  "company_name": "현대자동차 (주)",
  "contact_name": "박과장",
  "phone": "02-3456-7890",
  "address": "서울시 서초구 헌릉로 12",
  "industry": "제조",
  "grade": "B",
  "is_active": true
}
```

| 필드 | 타입 | 필수 | 유효성 검증 |
|------|------|------|------------|
| `customer_code` | string | ✅ | 영문+숫자, unique, 최대 20자 |
| `company_name` | string | ✅ | 최대 100자 |
| `contact_name` | string | - | 최대 50자 |
| `phone` | string | - | 전화번호 형식 |
| `address` | string | - | 최대 200자 |
| `industry` | string | - | `전자` / `화학` / `제조` / `IT` / `유통` / `기타` |
| `grade` | string | - | `VIP` / `A` / `B` / `C` |
| `is_active` | boolean | - | 기본값: `true` |

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 88,
    "customer_code": "C-0010",
    "company_name": "현대자동차 (주)",
    "is_active": true,
    "created_at": "2025-05-10T09:00:00Z"
  }
}
```

---

### 8.4 고객 수정

```
PUT /customers/:id
```

**권한**: `MANAGER`

**Request Body**: 8.3과 동일 구조 (`customer_code` 변경 불가)

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 88,
    "customer_code": "C-0010",
    "company_name": "현대자동차 (주)",
    "updated_at": "2025-05-10T10:00:00Z"
  }
}
```

---

## 9. 영업사원 마스터 API

### 9.1 영업사원 목록 조회

```
GET /salespersons
```

**권한**: `MANAGER`

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `keyword` | string | - | 이름 부분 검색 |
| `department` | string | - | 부서 필터 |
| `is_active` | boolean | - | 기본값: `true` |
| `page` | integer | - | 기본값: 1 |
| `size` | integer | - | 기본값: 20 |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "employee_no": "EMP-001",
        "name": "홍길동",
        "department": "영업1팀",
        "position": "대리",
        "email": "hong@company.com",
        "is_active": true,
        "created_at": "2023-03-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total_count": 24,
      "total_pages": 2
    }
  }
}
```

---

### 9.2 영업사원 상세 조회

```
GET /salespersons/:id
```

**권한**: `MANAGER`

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_no": "EMP-001",
    "name": "홍길동",
    "department": "영업1팀",
    "position": "대리",
    "email": "hong@company.com",
    "is_active": true,
    "created_at": "2023-03-01T00:00:00Z",
    "updated_at": "2025-01-10T00:00:00Z"
  }
}
```

---

### 9.3 영업사원 등록

```
POST /salespersons
```

**권한**: `MANAGER`

**Request Body**

```json
{
  "employee_no": "EMP-025",
  "name": "박신입",
  "department": "영업2팀",
  "position": "사원",
  "email": "park@company.com",
  "password": "Init@1234",
  "is_active": true
}
```

| 필드 | 타입 | 필수 | 유효성 검증 |
|------|------|------|------------|
| `employee_no` | string | ✅ | 영문+숫자, unique, 최대 20자 |
| `name` | string | ✅ | 최대 50자 |
| `department` | string | ✅ | 최대 50자 |
| `position` | string | - | 최대 30자 |
| `email` | string | ✅ | 이메일 형식, unique |
| `password` | string | ✅ | 8자 이상, 영문+숫자+특수문자 조합 |
| `is_active` | boolean | - | 기본값: `true` |

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "employee_no": "EMP-025",
    "name": "박신입",
    "email": "park@company.com",
    "is_active": true,
    "created_at": "2025-05-10T09:00:00Z"
  }
}
```

---

### 9.4 영업사원 수정

```
PUT /salespersons/:id
```

**권한**: `MANAGER`

**Request Body**: 9.3과 동일 구조 (`employee_no` 변경 불가, `password` 생략 가능)

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "employee_no": "EMP-025",
    "name": "박신입",
    "updated_at": "2025-05-10T10:00:00Z"
  }
}
```

---

## 10. 에러 코드 목록

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | `BAD_REQUEST` | 요청 형식 오류 |
| 400 | `VALIDATION_ERROR` | 입력값 유효성 검증 실패 |
| 401 | `UNAUTHORIZED` | 인증 토큰 없음 또는 만료 |
| 401 | `INVALID_CREDENTIALS` | 로그인 자격증명 불일치 |
| 401 | `TOKEN_EXPIRED` | 액세스 토큰 만료 |
| 403 | `FORBIDDEN` | 권한 없음 (타인 데이터 접근 등) |
| 404 | `NOT_FOUND` | 리소스를 찾을 수 없음 |
| 409 | `DUPLICATE_REPORT` | 같은 날짜 보고서 중복 |
| 409 | `DUPLICATE_FIELD` | unique 제약 필드 중복 (사번, 이메일 등) |
| 422 | `IMMUTABLE_STATUS` | 변경 불가 상태에서 수정 시도 |
| 422 | `INVALID_STATUS_TRANSITION` | 허용되지 않는 상태 전환 |
| 422 | `MIN_VISIT_RECORD` | 방문 내역 최소 건수 미만 |
| 422 | `FUTURE_DATE_NOT_ALLOWED` | 미래 날짜로 보고서 작성 시도 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

---

## 부록. API 엔드포인트 요약

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| POST | `/auth/login` | 로그인 | 공개 |
| POST | `/auth/logout` | 로그아웃 | 인증 |
| POST | `/auth/refresh` | 토큰 갱신 | 공개 |
| GET | `/reports` | 보고서 목록 | SALESPERSON / MANAGER |
| GET | `/reports/:id` | 보고서 상세 | SALESPERSON / MANAGER |
| POST | `/reports` | 보고서 생성 | SALESPERSON |
| PUT | `/reports/:id` | 보고서 수정 | SALESPERSON |
| PATCH | `/reports/:id/submit` | 보고서 제출 | SALESPERSON |
| PATCH | `/reports/:id/confirm` | 보고서 확인 처리 | MANAGER |
| POST | `/reports/:report_id/visit-records` | 방문 내역 추가 | SALESPERSON |
| PUT | `/reports/:report_id/visit-records/:id` | 방문 내역 수정 | SALESPERSON |
| DELETE | `/reports/:report_id/visit-records/:id` | 방문 내역 삭제 | SALESPERSON |
| POST | `/reports/:report_id/problems` | 과제·상담 추가 | SALESPERSON |
| PUT | `/reports/:report_id/problems/:id` | 과제·상담 수정 | SALESPERSON |
| DELETE | `/reports/:report_id/problems/:id` | 과제·상담 삭제 | SALESPERSON |
| POST | `/reports/:report_id/plans` | 내일 할 일 추가 | SALESPERSON |
| PUT | `/reports/:report_id/plans/:id` | 내일 할 일 수정 | SALESPERSON |
| DELETE | `/reports/:report_id/plans/:id` | 내일 할 일 삭제 | SALESPERSON |
| POST | `/problems/:problem_id/comments` | 댓글 등록 (Problem) | MANAGER |
| POST | `/plans/:plan_id/comments` | 댓글 등록 (Plan) | MANAGER |
| PUT | `/comments/:id` | 댓글 수정 | MANAGER |
| DELETE | `/comments/:id` | 댓글 삭제 | MANAGER |
| GET | `/customers` | 고객 목록 | SALESPERSON / MANAGER |
| GET | `/customers/:id` | 고객 상세 | SALESPERSON / MANAGER |
| POST | `/customers` | 고객 등록 | MANAGER |
| PUT | `/customers/:id` | 고객 수정 | MANAGER |
| GET | `/salespersons` | 영업사원 목록 | MANAGER |
| GET | `/salespersons/:id` | 영업사원 상세 | MANAGER |
| POST | `/salespersons` | 영업사원 등록 | MANAGER |
| PUT | `/salespersons/:id` | 영업사원 수정 | MANAGER |
