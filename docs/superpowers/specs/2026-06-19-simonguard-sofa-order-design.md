<!-- 사이몬가드얼라이언스 소파 발주 사이트 설계 명세 -->

# 사이몬가드얼라이언스 — 소파 발주 사이트 설계

- **작성일**: 2026-06-19
- **상태**: 승인됨 (브레인스토밍 완료)
- **다음 단계**: writing-plans (구현 계획)

## 1. 개요

모바일/태블릿에 최적화된 소파 발주 관리 웹앱. 여러 사용자가 로그인해 같은 발주 데이터를 공유한다. 모듈 소파를 브랜드 → 모델 → 모듈 조합 방식으로 발주하고, 원단과 발주회사를 선택한다. 슈퍼 관리자는 마스터데이터와 계정을 관리한다. 최종 발주서는 한글 PDF로 생성해 공유/출력한다.

## 2. 사용자와 권한

| 역할 | 권한 |
|---|---|
| 슈퍼 관리자 (super_admin) | 사용자 계정 생성, 모든 마스터데이터 CRUD, 발주 전체 CRUD |
| 일반 사용자 (user) | 마스터데이터 조회, 발주 전체 조회 + 등록/수정/삭제(팀 공유) |

- 공개 회원가입 없음. 계정은 슈퍼 관리자만 생성한다.
- 계정 생성은 Supabase Edge Function(서버측, service_role 사용)으로 처리해 보안키를 브라우저에 노출하지 않는다.

## 3. 기술 스택

- 프론트엔드: Vite + React + TypeScript
- 스타일: Tailwind CSS + shadcn/ui (모바일/태블릿 우선 반응형)
- 라우팅: react-router
- 백엔드/DB/인증: Supabase (PostgreSQL + Auth + Row Level Security + Edge Functions)
- PDF: @react-pdf/renderer + Noto Sans KR 폰트 임베드
- 캘린더: 월 단위 그리드(커스텀 또는 경량 라이브러리), 납기일 기준 마킹
- 테스트: Vitest + React Testing Library (핵심 로직/컴포넌트), 핵심 플로우 e2e는 선택

## 4. 데이터 모델 (PostgreSQL)

```
profiles            (id PK→auth.users, name, role['super_admin'|'user'], created_at)
brands              (id PK, name, created_at)
sofa_models         (id PK, brand_id FK→brands, name, created_at)
modules             (id PK, model_id FK→sofa_models, name, created_at)
fabric_companies    (id PK, name, created_at)
fabrics             (id PK, company_id FK→fabric_companies, name, color, created_at)
order_companies     (id PK, name, created_at)
orders              (id PK, order_no, brand_id FK, model_id FK, fabric_id FK,
                     order_company_id FK, order_date, due_date, 
                     status['ordered'|'producing'|'shipping'|'done'],
                     note, created_by FK→profiles, created_at, updated_at)
order_items         (id PK, order_id FK→orders, module_id FK→modules, quantity)
```

### 관계 규칙

- 브랜드 1 : N 소파모델, 소파모델 1 : N 모듈 (모듈은 특정 모델에 속함)
- 원단회사 1 : N 원단(색상별 행)
- 발주 1건 : N order_items (모듈 조합 + 각 수량)
- 발주 1건 : 원단 1개(`orders.fabric_id`), 발주회사 1개(`orders.order_company_id`)

### 상태 단계

`ordered`(발주됨) → `producing`(생산중) → `shipping`(출고/배송) → `done`(완료). 캘린더/리스트에서 상태별 색상으로 구분.

## 5. 화면 구성

1. **로그인** — 첫 진입 페이지. 이메일/비밀번호. 인증 성공 시 메인으로 이동.
2. **메인 (캘린더 + 발주 리스트)**
   - 캘린더: 납기일 기준으로 발주를 날짜에 표시, 상태별 색상.
   - 발주 리스트: 상태·브랜드·발주회사·기간 필터. 행 클릭 시 상세로 이동.
   - "발주 등록" 진입점.
3. **발주 등록/수정** — 브랜드 → 모델 → 모듈 체크+수량 → 원단(회사→원단/색상) → 발주회사 → 납기일 → 상태 → 비고. 단계형/반응형 폼.
4. **발주 상세** — 발주 내용 조회, 수정/삭제, **발주서 PDF 생성** 버튼.
5. **어드민 (슈퍼 관리자 전용)** — 탭: 브랜드/모델/모듈, 원단회사/원단, 발주회사, 사용자 계정. 각 탭 등록/수정/삭제.

## 6. 발주서 PDF

- 발주 상세에서 PDF 생성.
- @react-pdf/renderer + Noto Sans KR 임베드로 한글 깨짐 없는 벡터 PDF.
- 공유: PDF 파일 다운로드(모바일 공유 시트 연동 가능). 출력: 브라우저 인쇄.
- 내용: 사이몬가드얼라이언스 머리글, 발주일/납기일, 발주회사, 브랜드·모델, 모듈 조합 표(모듈명+수량), 원단(회사/명/색상), 상태, 비고.

## 7. 권한 적용 (RLS 개요)

- 모든 테이블 RLS 활성화. 인증 사용자만 접근.
- 마스터데이터(brands, sofa_models, modules, fabric_companies, fabrics, order_companies): SELECT는 인증 사용자 전체, INSERT/UPDATE/DELETE는 super_admin만.
- orders, order_items: SELECT/INSERT/UPDATE/DELETE 인증 사용자 전체(팀 공유). super_admin도 동일+.
- profiles: 본인 행 SELECT, super_admin은 전체 관리. 계정 생성은 Edge Function 경유.

## 8. 반응형 / 모바일·태블릿 최적화

- 모바일 우선 레이아웃. 하단 탭 또는 햄버거 내비.
- 터치 친화적 버튼/입력. 캘린더와 리스트는 화면 크기에 따라 세로 스택 ↔ 분할 배치.

## 9. 에러 처리

- 인증 실패, 권한 없는 접근(어드민 라우트), 네트워크/DB 오류에 대한 사용자 피드백 토스트.
- 폼 검증: 필수값(브랜드/모델/최소 1개 모듈/원단/발주회사/납기일) 누락 시 등록 차단.

## 10. 테스트 전략

- 단위/컴포넌트: 폼 검증, 권한 분기, 발주 합계/모듈 조합 로직 (Vitest + RTL).
- 핵심 플로우(로그인 → 발주 등록 → PDF 생성)는 수동 검증 또는 경량 e2e.

## 11. 범위 밖 (YAGNI)

- 모듈별 개별 원단 선택(발주 전체 1개로 확정).
- 결제/재고/배송 추적 연동.
- 다국어(한국어 단일).
