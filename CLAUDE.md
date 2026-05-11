# 영업 일일 보고 시스템 — 요구사항 정의 및 ER 다이어그램

\---

## 1\. 시스템 개요

영업사원이 당일 방문한 고객과 방문 내용을 기록하고, 현재 과제(Problem)와 내일 할 일(Plan)을 보고하는 일일 보고 시스템입니다. 상급자는 보고서를 조회하고 Problem·Plan 항목에 댓글로 피드백을 남길 수 있습니다.

\---

## 2\. 사용자 및 권한

|역할|기능|
|-|-|
|영업사원|일일 보고서 작성, 수정, 조회|
|상급자 (관리자)|보고서 조회, Problem/Plan에 댓글 작성|

\---

## 3\. 마스터 데이터

### 3.1 영업사원 마스터 (SALESPERSON)

영업사원의 기본 인적 정보를 관리합니다.

|항목|설명|
|-|-|
|사번 (employee\_no)|사원 고유 식별번호, unique|
|이름|성명|
|부서|소속 부서|
|직급|직위|
|이메일|업무용 이메일|
|활성여부 (is\_active)|재직/퇴직 구분|

### 3.2 고객 마스터 (CUSTOMER)

방문 대상 고객사의 기본 정보를 관리합니다.

|항목|설명|
|-|-|
|고객코드 (customer\_code)|고객사 고유 코드, unique|
|고객사명|회사명|
|담당자명|고객사 내 담당자|
|연락처|전화번호|
|주소|방문지 주소|
|업종|산업 분류|
|등급|고객 등급 (예: VIP, A, B, C)|
|활성여부 (is\_active)|거래중/거래종료 구분|

\---

## 4\. 기능 요구사항

### 4.1 일일 보고서 (DAILY\_REPORT)

* 영업사원 1명 + 날짜 1건으로 보고서 1개 생성 (`salesperson\\\_id` + `report\\\_date` unique 제약)
* 보고서 상태: `draft` (작성중) → `submitted` (제출) → `confirmed` (확인완료)
* 작성·수정 일시 이력 보관

### 4.2 방문 내역 (VISIT\_RECORD)

* 하루에 여러 고객 방문 행을 추가할 수 있음 (1:N 구조)
* 각 행에 방문한 고객(고객 마스터 참조), 방문 내용, 방문 결과를 기록
* `sort\\\_order`로 방문 순서 관리

### 4.3 과제·상담 (PROBLEM)

* 현재 진행 중인 과제나 상담 내용을 작성
* 하루에 여러 건 추가 가능 (1:N 구조)
* 카테고리 분류 (예: 가격, 납기, 기술, 경쟁사 등)
* `sort\\\_order`로 항목 순서 관리

### 4.4 내일 할 일 (PLAN)

* 익일 예정 업무를 작성
* 하루에 여러 건 추가 가능 (1:N 구조)
* 우선순위 설정 (예: high, medium, low)
* `sort\\\_order`로 항목 순서 관리

### 4.5 댓글 (COMMENT)

* Problem, Plan 각 항목에 상급자가 댓글을 남길 수 있음
* 하나의 항목에 여러 댓글 작성 가능 (1:N 구조)
* 댓글 작성자 및 작성시각 이력 보관
* `target\\\_type` ('PROBLEM' | 'PLAN') + `target\\\_id` 조합으로 댓글 대상 식별 (다형성 설계)

\---

## 5\. 비기능 요구사항

|항목|내용|
|-|-|
|중복 방지|영업사원 1명당 날짜 1건 보고서 unique 제약|
|이력 관리|모든 주요 테이블에 `created\\\_at`, `updated\\\_at` 보관|
|데이터 재사용|고객 마스터를 여러 보고서에서 FK 참조|
|확장성|댓글 대상 타입을 추가하기 쉽도록 다형성(polymorphic) 구조 채택|

\---

## 6\. ER 다이어그램

```mermaid
erDiagram
  SALESPERSON {
    int id PK
    string employee\\\_no UK
    string name
    string department
    string position
    string email
    boolean is\\\_active
    datetime created\\\_at
  }

  CUSTOMER {
    int id PK
    string customer\\\_code UK
    string company\\\_name
    string contact\\\_name
    string phone
    string address
    string industry
    string grade
    boolean is\\\_active
    datetime created\\\_at
  }

  DAILY\\\_REPORT {
    int id PK
    int salesperson\\\_id FK
    date report\\\_date
    string status
    datetime created\\\_at
    datetime updated\\\_at
  }

  VISIT\\\_RECORD {
    int id PK
    int daily\\\_report\\\_id FK
    int customer\\\_id FK
    string visit\\\_content
    string visit\\\_result
    int sort\\\_order
    datetime created\\\_at
  }

  PROBLEM {
    int id PK
    int daily\\\_report\\\_id FK
    string content
    string category
    int sort\\\_order
    datetime created\\\_at
    datetime updated\\\_at
  }

  PLAN {
    int id PK
    int daily\\\_report\\\_id FK
    string content
    string priority
    int sort\\\_order
    datetime created\\\_at
    datetime updated\\\_at
  }

  COMMENT {
    int id PK
    string target\\\_type
    int target\\\_id
    int author\\\_id FK
    string content
    datetime created\\\_at
    datetime updated\\\_at
  }

  SALESPERSON ||--o{ DAILY\\\_REPORT : "작성"
  DAILY\\\_REPORT ||--o{ VISIT\\\_RECORD : "포함"
  DAILY\\\_REPORT ||--o{ PROBLEM : "포함"
  DAILY\\\_REPORT ||--o{ PLAN : "포함"
  CUSTOMER ||--o{ VISIT\\\_RECORD : "방문됨"
  PROBLEM ||--o{ COMMENT : "달림"
  PLAN ||--o{ COMMENT : "달림"
  SALESPERSON ||--o{ COMMENT : "작성"
```

\---

## 7\. 주요 설계 포인트

### 7.1 보고서 unique 제약

`(salesperson\\\_id, report\\\_date)` 복합 unique 키를 적용하여 영업사원당 날짜 1건만 허용합니다.

### 7.2 COMMENT의 다형성 관계

Problem과 Plan 양쪽에 댓글이 달릴 수 있으므로, `target\\\_type` ('PROBLEM' | 'PLAN')과 `target\\\_id`를 조합하는 polymorphic 방식으로 설계했습니다.

> \\\*\\\*대안\\\*\\\*: 구현 복잡도를 낮추려면 `PROBLEM\\\_COMMENT` / `PLAN\\\_COMMENT` 테이블로 분리하는 방법도 있습니다.

### 7.3 sort\_order 컬럼

방문 내역(VISIT\_RECORD), 과제(PROBLEM), 내일 할 일(PLAN) 모두 하루에 여러 건이 추가되므로 `sort\\\_order`로 표시 순서를 명시적으로 관리합니다.

### 7.4 보고서 상태 관리

`DAILY\\\_REPORT.status` 컬럼으로 `draft → submitted → confirmed` 흐름을 관리하여 상급자가 확인 처리할 수 있도록 합니다.



\## 8. 화면설계



@doc/SCREEN\_DESIGN.md



\## 9. API 명세서



@doc/API\_SCHEME.md



\## 10. 테스트 명세서



@doc/TEST\_DEFINITION.md

