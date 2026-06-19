# 사이몬가드얼라이언스 — 소파 발주 관리 웹앱

모바일·태블릿 최적화 소파 발주 관리 시스템입니다. 브랜드·모델·모듈·원단 마스터 데이터를 기반으로 발주를 등록·관리하고, 납기일 캘린더 및 발주서 PDF 출력까지 지원합니다.

---

## 기술 스택

| 분류 | 라이브러리 |
|---|---|
| 번들러 | Vite |
| UI | React 19, TypeScript, Tailwind CSS |
| 라우팅 | React Router v7 |
| 서버 상태 | TanStack React Query v5 |
| 백엔드 | Supabase (PostgreSQL + Auth + Edge Functions + RLS) |
| PDF | @react-pdf/renderer (한글 NotoSansKR 내장) |

---

## 사전 준비

- Node.js **20 이상**
- [Supabase](https://supabase.com) 프로젝트 생성 (무료 플랜 가능)

---

## 설치

```bash
npm install
```

---

## 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다. 형식은 `.env.example`을 참고하세요.

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Supabase 대시보드 **Settings > API** 페이지에서 URL과 `anon` 키를 확인할 수 있습니다.

---

## DB 마이그레이션 적용

`supabase/migrations/0001_init.sql`을 Supabase에 적용하면 9개 테이블과 RLS 정책이 생성됩니다.

자세한 적용 방법(대시보드 SQL Editor / Supabase CLI)과 스키마 개요는 [`supabase/README.md`](supabase/README.md)를 참조하세요.

---

## 최초 슈퍼관리자 시드

마이그레이션 적용 후 첫 슈퍼관리자 계정을 설정합니다.

1. Supabase 대시보드 **Authentication** 메뉴에서 사용자를 1명 생성합니다.
2. 생성된 사용자의 UUID를 복사합니다.
3. SQL Editor에서 아래 쿼리를 실행합니다.

```sql
update profiles
set role = 'super_admin', name = '관리자'
where id = '<생성된 uuid>';
```

이후 앱에서 해당 계정으로 로그인하면 슈퍼관리자 권한으로 어드민 화면에 접근할 수 있습니다.

---

## 계정 생성 Edge Function 배포

일반 사용자 계정은 어드민 화면의 **계정** 탭에서 생성합니다. 이를 위해 Edge Function을 먼저 배포해야 합니다.

```bash
supabase link --project-ref <your-project-ref>
supabase functions deploy create-user
```

배포 후 슈퍼관리자가 어드민 화면 > 계정 탭에서 이메일·이름·비밀번호를 입력하여 새 사용자를 생성할 수 있습니다.

---

## 실행

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 테스트
npm test
```

---

## 주요 화면

| 화면 | 설명 |
|---|---|
| 로그인 | 이메일/비밀번호 로그인 |
| 메인 (홈) | 납기일 기준 발주 캘린더 + 발주 리스트(상태·브랜드·날짜 필터) |
| 발주 등록·수정 | 브랜드·모델·모듈 조합, 원단 선택, 발주처·납기일·수량 입력 |
| 발주 상세 | 발주 정보 전체 조회 + 발주서 PDF 다운로드/인쇄 |
| 어드민 — 브랜드·모델·모듈 | 소파 마스터 데이터 CRUD (슈퍼관리자 전용) |
| 어드민 — 원단 | 원단 업체·원단명·색상 CRUD (슈퍼관리자 전용) |
| 어드민 — 발주회사 | 발주처 마스터 CRUD (슈퍼관리자 전용) |
| 어드민 — 계정 | 사용자 계정 생성 (슈퍼관리자 전용) |

---

## 권한 모델

| 구분 | 권한 |
|---|---|
| **슈퍼관리자** (`super_admin`) | 마스터 데이터(브랜드·모델·모듈·원단·발주회사) CRUD, 사용자 계정 생성, 발주 전체 CRUD |
| **일반 사용자** (`user`) | 발주 등록·수정·삭제·조회. 마스터 데이터 조회(쓰기 불가) |

권한 강제는 Supabase **RLS(Row Level Security) 정책**으로 서버 측에서 실행됩니다. 클라이언트 UI에서의 메뉴 숨김은 편의 기능이며, 실제 보안 경계는 RLS입니다.

발주 상태는 **발주됨 → 생산중 → 출고·배송 → 완료** 4단계로 관리됩니다.
