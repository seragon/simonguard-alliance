# 사이몬가드얼라이언스 소파 발주 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일/태블릿에 최적화된 모듈 소파 발주 관리 웹앱을 구축한다(로그인, 캘린더+발주리스트, 발주 CRUD, 한글 PDF 발주서, 슈퍼관리자 어드민).

**Architecture:** Vite+React+TS SPA가 Supabase(PostgreSQL/Auth/RLS/Edge Functions)와 직접 통신한다. 데이터 접근은 React Query 훅으로 캡슐화하고, 순수 로직(검증/날짜그룹/집계)을 UI에서 분리해 단위 테스트한다. 권한은 RLS(서버)와 라우트 가드(클라이언트) 이중으로 적용한다.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, react-router-dom, @tanstack/react-query, @supabase/supabase-js, @react-pdf/renderer, Vitest + React Testing Library.

## Global Constraints

- 언어: 한국어 UI 단일. 새 소스 파일 첫 줄에 역할을 설명하는 한국어 주석 1줄(config 파일 제외).
- Node.js >= 20, npm 사용.
- 권한 역할 값은 정확히 `'super_admin'` 또는 `'user'`.
- 발주 상태 값은 정확히 `'ordered' | 'producing' | 'shipping' | 'done'`.
- 캘린더 표시 기준 날짜는 항상 `orders.due_date`(납기일).
- 원단은 발주당 1개(`orders.fabric_id`). 모듈별 개별 원단 없음.
- 공개 회원가입 없음. 계정 생성은 Supabase Edge Function(service_role) 경유. service_role 키는 절대 클라이언트 번들에 포함하지 않는다.
- 비밀정보는 `.env`(VITE_ 접두사 공개키만 클라이언트). `.env`는 git 제외.
- 커밋은 의미 단위. 메시지는 한국어 가능, 마지막 줄에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## File Structure

```
.env.example
index.html
package.json
vite.config.ts
tailwind.config.js
postcss.config.js
tsconfig.json
src/
  main.tsx                      앱 진입점 + 라우터 + QueryClient
  App.tsx                       라우트 정의
  index.css                     Tailwind 지시자
  lib/
    supabase.ts                 Supabase 클라이언트
    queryClient.ts              React Query 클라이언트
  types/
    db.ts                       DB 엔티티 타입
  domain/
    validation.ts              발주 폼 검증(순수 함수)
    calendar.ts                납기일 기준 발주 그룹화(순수 함수)
    status.ts                  상태 라벨/색상 매핑(순수 함수)
  auth/
    AuthProvider.tsx           세션/프로필 컨텍스트
    useAuth.ts                 컨텍스트 훅
    RequireAuth.tsx            인증 가드
    RequireSuperAdmin.tsx      슈퍼관리자 가드
  data/
    masterData.ts              마스터 테이블 CRUD 훅(브랜드/모델/모듈/원단/회사)
    orders.ts                  발주 CRUD 훅
    accounts.ts                계정 생성/목록 훅(Edge Function 호출)
  components/
    ui/                        shadcn/ui 생성 컴포넌트
    AppLayout.tsx              반응형 셸 + 내비
    Toaster 연동
  pages/
    LoginPage.tsx
    HomePage.tsx               캘린더 + 발주리스트
    OrderFormPage.tsx          발주 등록/수정
    OrderDetailPage.tsx        발주 상세 + PDF 버튼
    AdminPage.tsx              어드민 탭 셸
    admin/
      BrandModuleTab.tsx
      FabricTab.tsx
      OrderCompanyTab.tsx
      AccountTab.tsx
  pdf/
    OrderSheetDocument.tsx     발주서 PDF 문서
    fonts/NotoSansKR-*.ttf     임베드 폰트
supabase/
  migrations/0001_init.sql     스키마 + RLS
  functions/create-user/index.ts  계정 생성 Edge Function
```

---

## Task 1: 프로젝트 스캐폴딩 (Vite + React + TS + Tailwind)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Modify: `index.html`(기존 빈 파일 대체)

**Interfaces:**
- Produces: 실행 가능한 Vite 개발 서버, Tailwind 적용된 빈 앱.

- [ ] **Step 1: Vite 프로젝트 생성**

Run:
```bash
npm create vite@latest . -- --template react-ts
npm install
```
기존 빈 `index.html`은 템플릿이 덮어쓴다. 충돌 시 템플릿 버전 채택.

- [ ] **Step 2: Tailwind + 의존성 설치**

Run:
```bash
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
npm install react-router-dom @tanstack/react-query @supabase/supabase-js @react-pdf/renderer
```

- [ ] **Step 3: Tailwind 설정**

`tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Vitest 설정**

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: "./src/test/setup.ts" },
});
```

`src/test/setup.ts`:
```ts
import "@testing-library/jest-dom";
```
`tsconfig.json`의 compilerOptions에 `"types": ["vitest/globals", "@testing-library/jest-dom"]` 추가.

- [ ] **Step 5: 최소 App 렌더 + 빌드 검증**

`src/App.tsx`:
```tsx
// 앱 루트 컴포넌트(라우트는 Task 4에서 확장)
export default function App() {
  return <div className="p-4 text-xl">사이몬가드얼라이언스</div>;
}
```

Run: `npm run build`
Expected: 빌드 성공(에러 0).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Vite+React+TS+Tailwind 프로젝트 스캐폴딩"
```

---

## Task 2: Supabase 스키마 + RLS 마이그레이션

**Files:**
- Create: `supabase/migrations/0001_init.sql`

**Interfaces:**
- Produces: 9개 테이블, `role`/`status` 제약, RLS 정책, `is_super_admin()` 헬퍼, `handle_new_user` 트리거.

- [ ] **Step 1: 스키마 SQL 작성**

`supabase/migrations/0001_init.sql`:
```sql
-- 사이몬가드얼라이언스 초기 스키마 및 RLS 정책

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  role text not null default 'user' check (role in ('super_admin','user')),
  created_at timestamptz not null default now()
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table sofa_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references sofa_models on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table fabric_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table fabrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references fabric_companies on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table order_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create sequence order_no_seq;
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default ('SO-' || to_char(now(),'YYMMDD') || '-' || lpad(nextval('order_no_seq')::text, 4, '0')),
  brand_id uuid not null references brands,
  model_id uuid not null references sofa_models,
  fabric_id uuid not null references fabrics,
  order_company_id uuid not null references order_companies,
  order_date date not null default current_date,
  due_date date not null,
  status text not null default 'ordered' check (status in ('ordered','producing','shipping','done')),
  note text not null default '',
  created_by uuid not null references profiles,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  module_id uuid not null references modules,
  quantity integer not null check (quantity > 0)
);
```

- [ ] **Step 2: 헬퍼 + 트리거 + RLS 추가** (같은 파일 이어서)

```sql
-- 슈퍼관리자 여부 헬퍼 (RLS 재귀 방지를 위해 security definer)
create or replace function is_super_admin()
returns boolean language sql security definer stable as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'super_admin');
$$;

-- 신규 auth 사용자 → profiles 행 자동 생성
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''),
          coalesce(new.raw_user_meta_data->>'role','user'));
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- RLS 활성화
alter table profiles enable row level security;
alter table brands enable row level security;
alter table sofa_models enable row level security;
alter table modules enable row level security;
alter table fabric_companies enable row level security;
alter table fabrics enable row level security;
alter table order_companies enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- profiles: 본인 조회, 슈퍼관리자 전체 관리
create policy profiles_select on profiles for select using (id = auth.uid() or is_super_admin());
create policy profiles_super_all on profiles for all using (is_super_admin()) with check (is_super_admin());

-- 마스터데이터: 인증자 조회, 슈퍼관리자만 쓰기 (6개 테이블 동일 패턴)
do $$
declare t text;
begin
  foreach t in array array['brands','sofa_models','modules','fabric_companies','fabrics','order_companies']
  loop
    execute format('create policy %1$s_select on %1$s for select using (auth.role() = ''authenticated'');', t);
    execute format('create policy %1$s_write on %1$s for all using (is_super_admin()) with check (is_super_admin());', t);
  end loop;
end $$;

-- 발주: 인증자 전체 공유 CRUD
create policy orders_all on orders for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy order_items_all on order_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

- [ ] **Step 3: Supabase 프로젝트에 적용**

Supabase 대시보드 SQL Editor에 `0001_init.sql` 전체를 붙여 실행하거나, Supabase CLI 사용 시 `supabase db push`.
Expected: 에러 없이 9개 테이블 + 정책 생성. `select count(*) from brands;` → 0행 성공.

- [ ] **Step 4: 최초 슈퍼관리자 시드**

Supabase 대시보드 Authentication에서 사용자 1명 생성 후, SQL Editor에서:
```sql
update profiles set role = 'super_admin', name = '관리자' where id = '<생성된 uuid>';
```
Expected: 1 row updated.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat: Supabase 스키마 및 RLS 마이그레이션 추가"
```

---

## Task 3: Supabase 클라이언트 + 타입 + React Query

**Files:**
- Create: `.env.example`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/types/db.ts`
- Modify: `.gitignore`(이미 `.env` 포함 확인), `src/main.tsx`

**Interfaces:**
- Produces: `supabase` 클라이언트, `queryClient`, DB 타입(`Profile`, `Brand`, `SofaModel`, `Module`, `FabricCompany`, `Fabric`, `OrderCompany`, `Order`, `OrderItem`, `OrderStatus`, `Role`).

- [ ] **Step 1: env 예시 + 클라이언트**

`.env.example`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
실제 값은 `.env`에 작성(git 제외 확인). `.gitignore`에 `.env` 없으면 추가.

`src/lib/supabase.ts`:
```ts
// Supabase 클라이언트 싱글턴
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon);
```

- [ ] **Step 2: 타입 정의**

`src/types/db.ts`:
```ts
// DB 엔티티 타입 정의
export type Role = "super_admin" | "user";
export type OrderStatus = "ordered" | "producing" | "shipping" | "done";

export interface Profile { id: string; name: string; role: Role; created_at: string; }
export interface Brand { id: string; name: string; created_at: string; }
export interface SofaModel { id: string; brand_id: string; name: string; created_at: string; }
export interface Module { id: string; model_id: string; name: string; created_at: string; }
export interface FabricCompany { id: string; name: string; created_at: string; }
export interface Fabric { id: string; company_id: string; name: string; color: string; created_at: string; }
export interface OrderCompany { id: string; name: string; created_at: string; }
export interface Order {
  id: string; order_no: string; brand_id: string; model_id: string; fabric_id: string;
  order_company_id: string; order_date: string; due_date: string; status: OrderStatus;
  note: string; created_by: string; created_at: string; updated_at: string;
}
export interface OrderItem { id: string; order_id: string; module_id: string; quantity: number; }
```

- [ ] **Step 3: React Query 클라이언트 + main 통합**

`src/lib/queryClient.ts`:
```ts
// React Query 전역 클라이언트
import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});
```

`src/main.tsx`:
```tsx
// 앱 진입점: 라우터 + React Query Provider
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Supabase 클라이언트, DB 타입, React Query 설정"
```

---

## Task 4: 도메인 순수 로직 (검증/상태/캘린더) — TDD

**Files:**
- Create: `src/domain/validation.ts`, `src/domain/status.ts`, `src/domain/calendar.ts`
- Test: `src/domain/validation.test.ts`, `src/domain/calendar.test.ts`, `src/domain/status.test.ts`

**Interfaces:**
- Produces:
  - `validateOrderForm(input: OrderFormInput): string[]` — 오류 메시지 배열(빈 배열=유효)
  - `OrderFormInput { brand_id, model_id, fabric_id, order_company_id, due_date, items: {module_id,quantity}[] }`
  - `statusLabel(s: OrderStatus): string`, `statusColor(s: OrderStatus): string`
  - `groupOrdersByDueDate<T extends {due_date:string}>(orders: T[]): Record<string, T[]>`

- [ ] **Step 1: 검증 실패 테스트 작성**

`src/domain/validation.test.ts`:
```ts
import { validateOrderForm, OrderFormInput } from "./validation";

const base: OrderFormInput = {
  brand_id: "b", model_id: "m", fabric_id: "f", order_company_id: "c",
  due_date: "2026-07-01", items: [{ module_id: "x", quantity: 1 }],
};

test("유효한 입력은 오류 없음", () => {
  expect(validateOrderForm(base)).toEqual([]);
});
test("브랜드 누락 감지", () => {
  expect(validateOrderForm({ ...base, brand_id: "" })).toContain("브랜드를 선택하세요.");
});
test("모듈 0개 감지", () => {
  expect(validateOrderForm({ ...base, items: [] })).toContain("모듈을 1개 이상 선택하세요.");
});
test("수량 0 이하 감지", () => {
  expect(validateOrderForm({ ...base, items: [{ module_id: "x", quantity: 0 }] }))
    .toContain("모듈 수량은 1 이상이어야 합니다.");
});
test("납기일 누락 감지", () => {
  expect(validateOrderForm({ ...base, due_date: "" })).toContain("납기일을 입력하세요.");
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/domain/validation.test.ts`
Expected: FAIL (validation 모듈 없음).

- [ ] **Step 3: 검증 구현**

`src/domain/validation.ts`:
```ts
// 발주 폼 검증 순수 함수
export interface OrderFormInput {
  brand_id: string; model_id: string; fabric_id: string; order_company_id: string;
  due_date: string; items: { module_id: string; quantity: number }[];
}

export function validateOrderForm(i: OrderFormInput): string[] {
  const errors: string[] = [];
  if (!i.brand_id) errors.push("브랜드를 선택하세요.");
  if (!i.model_id) errors.push("모델을 선택하세요.");
  if (!i.fabric_id) errors.push("원단을 선택하세요.");
  if (!i.order_company_id) errors.push("발주회사를 선택하세요.");
  if (!i.due_date) errors.push("납기일을 입력하세요.");
  if (i.items.length === 0) errors.push("모듈을 1개 이상 선택하세요.");
  if (i.items.some((it) => it.quantity < 1)) errors.push("모듈 수량은 1 이상이어야 합니다.");
  return errors;
}
```

- [ ] **Step 4: 상태/캘린더 테스트 작성**

`src/domain/status.test.ts`:
```ts
import { statusLabel, statusColor } from "./status";
test("상태 라벨", () => {
  expect(statusLabel("ordered")).toBe("발주됨");
  expect(statusLabel("done")).toBe("완료");
});
test("상태 색상은 4개 모두 정의", () => {
  for (const s of ["ordered","producing","shipping","done"] as const) {
    expect(statusColor(s)).toMatch(/^bg-/);
  }
});
```

`src/domain/calendar.test.ts`:
```ts
import { groupOrdersByDueDate } from "./calendar";
test("납기일 기준 그룹화", () => {
  const orders = [
    { id: "1", due_date: "2026-07-01" },
    { id: "2", due_date: "2026-07-01" },
    { id: "3", due_date: "2026-07-02" },
  ];
  const g = groupOrdersByDueDate(orders);
  expect(g["2026-07-01"]).toHaveLength(2);
  expect(g["2026-07-02"]).toHaveLength(1);
});
```

- [ ] **Step 5: 상태/캘린더 구현 + 실패→통과**

`src/domain/status.ts`:
```ts
// 발주 상태 라벨/색상 매핑
import type { OrderStatus } from "../types/db";
const LABEL: Record<OrderStatus, string> = {
  ordered: "발주됨", producing: "생산중", shipping: "출고/배송", done: "완료",
};
const COLOR: Record<OrderStatus, string> = {
  ordered: "bg-slate-400", producing: "bg-amber-500", shipping: "bg-sky-500", done: "bg-emerald-600",
};
export const statusLabel = (s: OrderStatus) => LABEL[s];
export const statusColor = (s: OrderStatus) => COLOR[s];
export const ALL_STATUSES: OrderStatus[] = ["ordered","producing","shipping","done"];
```

`src/domain/calendar.ts`:
```ts
// 발주를 납기일(YYYY-MM-DD) 기준으로 그룹화
export function groupOrdersByDueDate<T extends { due_date: string }>(orders: T[]): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const o of orders) (map[o.due_date] ??= []).push(o);
  return map;
}
```

Run: `npx vitest run src/domain`
Expected: 전체 PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain
git commit -m "feat: 발주 검증/상태/캘린더 도메인 로직 (TDD)"
```

---

## Task 5: 인증 (AuthProvider, 로그인, 라우트 가드)

**Files:**
- Create: `src/auth/AuthProvider.tsx`, `src/auth/useAuth.ts`, `src/auth/RequireAuth.tsx`, `src/auth/RequireSuperAdmin.tsx`, `src/pages/LoginPage.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`(AuthProvider 래핑)

**Interfaces:**
- Consumes: `supabase`(Task 3), `Profile`(Task 3)
- Produces:
  - `useAuth(): { session, profile, loading, isSuperAdmin, signIn(email,pw), signOut() }`
  - `<RequireAuth>`, `<RequireSuperAdmin>` 래퍼 컴포넌트

- [ ] **Step 1: AuthProvider 구현**

`src/auth/AuthProvider.tsx`:
```tsx
// 세션과 프로필을 로드해 컨텍스트로 제공
import { createContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/db";

interface AuthValue {
  session: Session | null; profile: Profile | null; loading: boolean; isSuperAdmin: boolean;
  signIn: (email: string, pw: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}
export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data as Profile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s) await loadProfile(s.user.id); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthValue = {
    session, profile, loading, isSuperAdmin: profile?.role === "super_admin",
    signIn: async (email, pw) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      return { error: error?.message ?? null };
    },
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

`src/auth/useAuth.ts`:
```ts
// AuthContext 소비 훅
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 2: 가드 구현**

`src/auth/RequireAuth.tsx`:
```tsx
// 미인증 사용자를 로그인으로 보내는 가드
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

`src/auth/RequireSuperAdmin.tsx`:
```tsx
// 슈퍼관리자만 통과시키는 가드
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useAuth();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 3: 로그인 페이지**

`src/pages/LoginPage.tsx`:
```tsx
// 첫 진입 로그인 페이지
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
export default function LoginPage() {
  const { signIn, session } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  if (session) { nav("/", { replace: true }); }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const { error } = await signIn(email, pw); setBusy(false);
    if (error) setErr("로그인 실패. 이메일/비밀번호를 확인하세요."); else nav("/", { replace: true });
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center">사이몬가드얼라이언스</h1>
        <input className="w-full border rounded-lg px-3 py-3" type="email" placeholder="이메일"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded-lg px-3 py-3" type="password" placeholder="비밀번호"
          value={pw} onChange={(e) => setPw(e.target.value)} required />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full bg-slate-900 text-white rounded-lg py-3 disabled:opacity-50">
          {busy ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: main에 AuthProvider 래핑 + App 라우트 골격**

`src/main.tsx`의 `<BrowserRouter>` 안쪽을 `<AuthProvider>`로 감싼다(App 위).

`src/App.tsx`:
```tsx
// 라우트 정의
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { RequireAuth } from "./auth/RequireAuth";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><div className="p-6">메인 (Task 8에서 구현)</div></RequireAuth>} />
    </Routes>
  );
}
```

- [ ] **Step 5: 빌드 + 수동 검증**

Run: `npm run build` → 성공.
`npm run dev` 후 브라우저: `/` 접근 시 `/login`으로 리다이렉트, Task 2에서 만든 슈퍼관리자 계정으로 로그인 시 메인 진입 확인.

- [ ] **Step 6: Commit**

```bash
git add src/auth src/pages/LoginPage.tsx src/App.tsx src/main.tsx
git commit -m "feat: 인증 컨텍스트, 로그인 페이지, 라우트 가드"
```

---

## Task 6: 반응형 레이아웃 셸 + 내비 + Toast

**Files:**
- Create: `src/components/AppLayout.tsx`, `src/components/Toast.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAuth`(Task 5)
- Produces: `<AppLayout>`(헤더+반응형 내비+Outlet), `useToast(): { show(msg, type?) }`, `<ToastHost/>`

- [ ] **Step 1: Toast 구현**

`src/components/Toast.tsx`:
```tsx
// 간단한 전역 토스트 (성공/오류 피드백)
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
type Toast = { id: number; msg: string; type: "info" | "error" };
const Ctx = createContext<{ show: (msg: string, type?: "info" | "error") => void } | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const show = useCallback((msg: string, type: "info" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, msg, type }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 inset-x-0 flex flex-col items-center gap-2 z-50 px-4">
        {items.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-lg text-white shadow ${t.type === "error" ? "bg-red-600" : "bg-slate-800"}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast within ToastProvider");
  return c;
}
```
`src/main.tsx`에서 `<AuthProvider>` 안쪽을 `<ToastProvider>`로 감싼다.

- [ ] **Step 2: 레이아웃 셸**

`src/components/AppLayout.tsx`:
```tsx
// 반응형 앱 셸: 상단 헤더 + 모바일 하단 탭/데스크톱 상단 메뉴
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function AppLayout() {
  const { isSuperAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const link = "px-3 py-2 rounded-lg text-sm";
  const active = ({ isActive }: { isActive: boolean }) =>
    `${link} ${isActive ? "bg-slate-900 text-white" : "text-slate-700"}`;
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 h-14 border-b bg-white sticky top-0 z-40">
        <span className="font-bold">사이몬가드얼라이언스</span>
        <nav className="hidden sm:flex gap-1 items-center">
          <NavLink to="/" className={active} end>발주</NavLink>
          {isSuperAdmin && <NavLink to="/admin" className={active}>어드민</NavLink>}
          <button onClick={async () => { await signOut(); nav("/login"); }} className={link}>로그아웃</button>
        </nav>
      </header>
      <main className="flex-1 p-4 pb-20 sm:pb-4 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 h-16 border-t bg-white flex justify-around items-center z-40">
        <NavLink to="/" className={active} end>발주</NavLink>
        {isSuperAdmin && <NavLink to="/admin" className={active}>어드민</NavLink>}
        <button onClick={async () => { await signOut(); nav("/login"); }} className={link}>로그아웃</button>
      </nav>
    </div>
  );
}
```

- [ ] **Step 3: App 라우트를 레이아웃 중첩 구조로 갱신**

`src/App.tsx`:
```tsx
// 라우트 정의 (레이아웃 중첩)
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireSuperAdmin } from "./auth/RequireSuperAdmin";
// 아래 페이지들은 후속 Task에서 생성. 임시 placeholder는 각 Task에서 실제 구현으로 교체.
import HomePage from "./pages/HomePage";
import OrderFormPage from "./pages/OrderFormPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders/new" element={<OrderFormPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders/:id/edit" element={<OrderFormPage />} />
        <Route path="/admin" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
      </Route>
    </Routes>
  );
}
```
참고: 후속 Task가 끝나기 전 빌드를 유지하려면, 다음 Task들을 순서대로 진행하며 각 페이지 파일을 먼저 최소 export로 생성한다(아래 Task 7~13에서 실제 구현).

- [ ] **Step 4: 임시 페이지 스텁 생성(빌드 유지용)**

각 파일에 `export default function X(){return <div/>;}` 형태 최소 스텁 생성: `src/pages/HomePage.tsx`, `OrderFormPage.tsx`, `OrderDetailPage.tsx`, `AdminPage.tsx`. 첫 줄 한국어 주석 포함.

Run: `npm run build` → 성공.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 반응형 레이아웃 셸, 내비게이션, 토스트"
```

---

## Task 7: 마스터데이터 접근 훅

**Files:**
- Create: `src/data/masterData.ts`
- Test: `src/data/masterData.test.ts`

**Interfaces:**
- Consumes: `supabase`, DB 타입
- Produces: 각 테이블별 `useList`/`useCreate`/`useUpdate`/`useDelete` 훅 + 제네릭 팩토리 `makeCrud<T>(table)`.
  - `useBrands()`, `useSofaModels(brandId?)`, `useModules(modelId?)`, `useFabricCompanies()`, `useFabrics(companyId?)`, `useOrderCompanies()`
  - mutation 훅: `useCreate(table)`, `useUpdate(table)`, `useDelete(table)` (React Query, 성공 시 해당 키 invalidate)

- [ ] **Step 1: 키 빌더 단위 테스트**

`src/data/masterData.test.ts`:
```ts
import { listKey } from "./masterData";
test("필터 없는 리스트 키", () => {
  expect(listKey("brands")).toEqual(["brands", {}]);
});
test("필터 있는 리스트 키", () => {
  expect(listKey("sofa_models", { brand_id: "b1" })).toEqual(["sofa_models", { brand_id: "b1" }]);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/data/masterData.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현**

`src/data/masterData.ts`:
```ts
// 마스터데이터 CRUD를 위한 React Query 훅 모음
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

type TableName =
  | "brands" | "sofa_models" | "modules"
  | "fabric_companies" | "fabrics" | "order_companies";

export function listKey(table: TableName, filter: Record<string, string> = {}) {
  return [table, filter] as const;
}

function useList<T>(table: TableName, filter: Record<string, string> = {}, enabled = true) {
  return useQuery({
    queryKey: listKey(table, filter),
    enabled,
    queryFn: async () => {
      let q = supabase.from(table).select("*").order("created_at", { ascending: true });
      for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
      const { data, error } = await q;
      if (error) throw error;
      return data as T[];
    },
  });
}

export const useBrands = () => useList<import("../types/db").Brand>("brands");
export const useSofaModels = (brandId?: string) =>
  useList<import("../types/db").SofaModel>("sofa_models", brandId ? { brand_id: brandId } : {}, !!brandId);
export const useModules = (modelId?: string) =>
  useList<import("../types/db").Module>("modules", modelId ? { model_id: modelId } : {}, !!modelId);
export const useFabricCompanies = () => useList<import("../types/db").FabricCompany>("fabric_companies");
export const useFabrics = (companyId?: string) =>
  useList<import("../types/db").Fabric>("fabrics", companyId ? { company_id: companyId } : {}, !!companyId);
export const useOrderCompanies = () => useList<import("../types/db").OrderCompany>("order_companies");

export function useCreate(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}
export function useUpdate(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...row }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase.from(table).update(row).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}
export function useDelete(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}
```

- [ ] **Step 4: 통과 확인 + 빌드**

Run: `npx vitest run src/data/masterData.test.ts` → PASS.
Run: `npm run build` → 성공.

- [ ] **Step 5: Commit**

```bash
git add src/data/masterData.ts src/data/masterData.test.ts
git commit -m "feat: 마스터데이터 CRUD 훅"
```

---

## Task 8: 어드민 — 브랜드/모델/모듈 + 원단 + 발주회사 탭

**Files:**
- Create: `src/pages/admin/BrandModuleTab.tsx`, `src/pages/admin/FabricTab.tsx`, `src/pages/admin/OrderCompanyTab.tsx`, `src/components/CrudList.tsx`
- Modify: `src/pages/AdminPage.tsx`

**Interfaces:**
- Consumes: Task 7 훅, `useToast`
- Produces: `<CrudList>` 재사용 컴포넌트(이름 1필드 항목의 목록+추가+수정+삭제), 어드민 탭 3종.

- [ ] **Step 1: 재사용 CrudList 컴포넌트**

`src/components/CrudList.tsx`:
```tsx
// 단일 이름 필드 항목의 목록/추가/수정/삭제 재사용 컴포넌트
import { useState } from "react";
import { useToast } from "./Toast";

interface Item { id: string; name: string }
interface Props {
  title: string;
  items: Item[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
export default function CrudList({ title, items, onCreate, onUpdate, onDelete }: Props) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const wrap = (fn: () => Promise<void>) => async () => {
    try { await fn(); } catch (e) { show("처리 중 오류가 발생했습니다.", "error"); }
  };
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="flex gap-2">
        <input className="border rounded-lg px-3 py-2 flex-1" placeholder={`${title} 이름`}
          value={name} onChange={(e) => setName(e.target.value)} />
        <button className="bg-slate-900 text-white rounded-lg px-4"
          onClick={wrap(async () => { if (!name.trim()) return; await onCreate(name.trim()); setName(""); show("추가됨"); })}>
          추가
        </button>
      </div>
      <ul className="divide-y border rounded-lg">
        {items.map((it) => (
          <Row key={it.id} item={it}
            onSave={(n) => onUpdate(it.id, n)} onDelete={() => onDelete(it.id)} />
        ))}
      </ul>
    </div>
  );
}
function Row({ item, onSave, onDelete }: { item: Item; onSave: (n: string) => Promise<void>; onDelete: () => Promise<void> }) {
  const { show } = useToast();
  const [edit, setEdit] = useState(false); const [v, setV] = useState(item.name);
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      {edit ? (
        <input className="border rounded px-2 py-1 flex-1" value={v} onChange={(e) => setV(e.target.value)} />
      ) : (
        <span className="flex-1">{item.name}</span>
      )}
      {edit ? (
        <button className="text-sm text-emerald-700"
          onClick={async () => { try { await onSave(v.trim()); setEdit(false); show("수정됨"); } catch { show("오류","error"); } }}>저장</button>
      ) : (
        <button className="text-sm text-slate-600" onClick={() => setEdit(true)}>수정</button>
      )}
      <button className="text-sm text-red-600"
        onClick={async () => { if (!confirm("삭제할까요?")) return; try { await onDelete(); show("삭제됨"); } catch { show("오류","error"); } }}>삭제</button>
    </li>
  );
}
```

- [ ] **Step 2: 브랜드/모델/모듈 탭(계층 선택)**

`src/pages/admin/BrandModuleTab.tsx`:
```tsx
// 브랜드→모델→모듈 계층 관리 탭
import { useState } from "react";
import { useBrands, useSofaModels, useModules, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";

export default function BrandModuleTab() {
  const [brandId, setBrandId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const brands = useBrands();
  const models = useSofaModels(brandId);
  const modules = useModules(modelId);
  const cB = useCreate("brands"), uB = useUpdate("brands"), dB = useDelete("brands");
  const cM = useCreate("sofa_models"), uM = useUpdate("sofa_models"), dM = useDelete("sofa_models");
  const cMo = useCreate("modules"), uMo = useUpdate("modules"), dMo = useDelete("modules");
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div>
        <CrudList title="브랜드" items={brands.data ?? []}
          onCreate={(name) => cB.mutateAsync({ name })}
          onUpdate={(id, name) => uB.mutateAsync({ id, name })}
          onDelete={(id) => dB.mutateAsync(id)} />
        <ul className="mt-2 text-sm">
          {(brands.data ?? []).map((b) => (
            <li key={b.id}><button className={brandId===b.id?"font-bold":""} onClick={() => { setBrandId(b.id); setModelId(undefined); }}>· {b.name} 선택</button></li>
          ))}
        </ul>
      </div>
      <div>
        {brandId ? (
          <>
            <CrudList title="소파 모델" items={models.data ?? []}
              onCreate={(name) => cM.mutateAsync({ name, brand_id: brandId })}
              onUpdate={(id, name) => uM.mutateAsync({ id, name })}
              onDelete={(id) => dM.mutateAsync(id)} />
            <ul className="mt-2 text-sm">
              {(models.data ?? []).map((m) => (
                <li key={m.id}><button className={modelId===m.id?"font-bold":""} onClick={() => setModelId(m.id)}>· {m.name} 선택</button></li>
              ))}
            </ul>
          </>
        ) : <p className="text-sm text-slate-500">브랜드를 선택하세요.</p>}
      </div>
      <div>
        {modelId ? (
          <CrudList title="모듈" items={modules.data ?? []}
            onCreate={(name) => cMo.mutateAsync({ name, model_id: modelId })}
            onUpdate={(id, name) => uMo.mutateAsync({ id, name })}
            onDelete={(id) => dMo.mutateAsync(id)} />
        ) : <p className="text-sm text-slate-500">모델을 선택하세요.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 원단 탭(원단회사→원단/색상)**

`src/pages/admin/FabricTab.tsx`:
```tsx
// 원단회사 및 원단(이름/색상) 관리 탭
import { useState } from "react";
import { useFabricCompanies, useFabrics, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";
import { useToast } from "../../components/Toast";

export default function FabricTab() {
  const { show } = useToast();
  const [companyId, setCompanyId] = useState<string>();
  const companies = useFabricCompanies();
  const fabrics = useFabrics(companyId);
  const cC = useCreate("fabric_companies"), uC = useUpdate("fabric_companies"), dC = useDelete("fabric_companies");
  const cF = useCreate("fabrics"), dF = useDelete("fabrics");
  const [fname, setFname] = useState(""); const [color, setColor] = useState("");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <CrudList title="원단회사" items={companies.data ?? []}
          onCreate={(name) => cC.mutateAsync({ name })}
          onUpdate={(id, name) => uC.mutateAsync({ id, name })}
          onDelete={(id) => dC.mutateAsync(id)} />
        <ul className="mt-2 text-sm">
          {(companies.data ?? []).map((c) => (
            <li key={c.id}><button className={companyId===c.id?"font-bold":""} onClick={() => setCompanyId(c.id)}>· {c.name} 선택</button></li>
          ))}
        </ul>
      </div>
      <div>
        {companyId ? (
          <div className="space-y-3">
            <h3 className="font-semibold">원단 (이름 + 색상)</h3>
            <div className="flex gap-2">
              <input className="border rounded-lg px-3 py-2 flex-1" placeholder="원단명" value={fname} onChange={(e)=>setFname(e.target.value)} />
              <input className="border rounded-lg px-3 py-2 flex-1" placeholder="색상" value={color} onChange={(e)=>setColor(e.target.value)} />
              <button className="bg-slate-900 text-white rounded-lg px-4"
                onClick={async ()=>{ if(!fname.trim()||!color.trim())return; try{ await cF.mutateAsync({ company_id: companyId, name: fname.trim(), color: color.trim() }); setFname(""); setColor(""); show("추가됨"); }catch{ show("오류","error"); } }}>추가</button>
            </div>
            <ul className="divide-y border rounded-lg">
              {(fabrics.data ?? []).map((f)=>(
                <li key={f.id} className="flex justify-between px-3 py-2">
                  <span>{f.name} / {f.color}</span>
                  <button className="text-sm text-red-600" onClick={async ()=>{ if(!confirm("삭제?"))return; try{ await dF.mutateAsync(f.id); show("삭제됨"); }catch{ show("오류","error"); } }}>삭제</button>
                </li>
              ))}
            </ul>
          </div>
        ) : <p className="text-sm text-slate-500">원단회사를 선택하세요.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 발주회사 탭 + AdminPage 탭 셸**

`src/pages/admin/OrderCompanyTab.tsx`:
```tsx
// 발주회사 관리 탭
import { useOrderCompanies, useCreate, useUpdate, useDelete } from "../../data/masterData";
import CrudList from "../../components/CrudList";
export default function OrderCompanyTab() {
  const list = useOrderCompanies();
  const c = useCreate("order_companies"), u = useUpdate("order_companies"), d = useDelete("order_companies");
  return (
    <div className="max-w-md">
      <CrudList title="발주회사" items={list.data ?? []}
        onCreate={(name) => c.mutateAsync({ name })}
        onUpdate={(id, name) => u.mutateAsync({ id, name })}
        onDelete={(id) => d.mutateAsync(id)} />
    </div>
  );
}
```

`src/pages/AdminPage.tsx`:
```tsx
// 어드민 페이지: 탭으로 마스터데이터/계정 관리
import { useState } from "react";
import BrandModuleTab from "./admin/BrandModuleTab";
import FabricTab from "./admin/FabricTab";
import OrderCompanyTab from "./admin/OrderCompanyTab";
import AccountTab from "./admin/AccountTab"; // Task 9에서 생성

const TABS = [
  { key: "brand", label: "브랜드/모델/모듈", el: <BrandModuleTab /> },
  { key: "fabric", label: "원단", el: <FabricTab /> },
  { key: "company", label: "발주회사", el: <OrderCompanyTab /> },
  { key: "account", label: "사용자 계정", el: <AccountTab /> },
];
export default function AdminPage() {
  const [tab, setTab] = useState("brand");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">어드민</h2>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${tab===t.key?"bg-slate-900 text-white":"bg-slate-100"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div>{TABS.find((t) => t.key === tab)?.el}</div>
    </div>
  );
}
```
참고: `AccountTab`은 Task 9에서 생성하므로, 그 전 빌드 유지를 위해 먼저 최소 스텁 생성.

- [ ] **Step 5: 빌드 + 수동 검증**

Run: `npm run build` → 성공.
`npm run dev`로 슈퍼관리자 로그인 → /admin에서 브랜드/모델/모듈/원단/발주회사 추가·수정·삭제가 DB에 반영되는지 확인.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 어드민 마스터데이터 탭(브랜드/모델/모듈, 원단, 발주회사)"
```

---

## Task 9: 계정 생성 Edge Function + 계정 관리 탭

**Files:**
- Create: `supabase/functions/create-user/index.ts`, `src/data/accounts.ts`, `src/pages/admin/AccountTab.tsx`

**Interfaces:**
- Consumes: `supabase`, `useToast`, `Profile`
- Produces:
  - Edge Function `create-user` (입력 `{email, password, name, role}`, super_admin 호출자만 허용)
  - `useAccounts()`(profiles 목록), `useCreateAccount()`(함수 호출)

- [ ] **Step 1: Edge Function 작성**

`supabase/functions/create-user/index.ts`:
```ts
// 슈퍼관리자 전용 사용자 계정 생성 Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 호출자 검증: super_admin 인지 확인
  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const { data: prof } = await caller.from("profiles").select("role").eq("id", user.id).single();
  if (prof?.role !== "super_admin") return json({ error: "forbidden" }, 403);

  const { email, password, name, role } = await req.json();
  if (!email || !password) return json({ error: "email/password required" }, 400);

  const admin = createClient(url, service);
  const { error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name: name ?? "", role: role === "super_admin" ? "super_admin" : "user" },
  });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
```

- [ ] **Step 2: 함수 배포**

Run:
```bash
supabase functions deploy create-user
```
Expected: 배포 성공. (service_role 키는 Supabase가 함수 환경에 자동 주입.)

- [ ] **Step 3: 계정 데이터 훅**

`src/data/accounts.ts`:
```ts
// 계정 목록 조회 및 Edge Function 기반 계정 생성 훅
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/db";

export function useAccounts() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at");
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string; name: string; role: "super_admin" | "user" }) => {
      const { data, error } = await supabase.functions.invoke("create-user", { body: input });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
```

- [ ] **Step 4: 계정 관리 탭**

`src/pages/admin/AccountTab.tsx`:
```tsx
// 사용자 계정 목록 및 생성 탭 (슈퍼관리자 전용)
import { useState } from "react";
import { useAccounts, useCreateAccount } from "../../data/accounts";
import { useToast } from "../../components/Toast";

export default function AccountTab() {
  const { show } = useToast();
  const accounts = useAccounts();
  const create = useCreateAccount();
  const [f, setF] = useState({ email: "", password: "", name: "", role: "user" as "user" | "super_admin" });
  async function submit() {
    if (!f.email || !f.password) { show("이메일/비밀번호를 입력하세요.", "error"); return; }
    try { await create.mutateAsync(f); setF({ email: "", password: "", name: "", role: "user" }); show("계정 생성됨"); }
    catch (e) { show("계정 생성 실패: " + (e as Error).message, "error"); }
  }
  return (
    <div className="space-y-4 max-w-lg">
      <h3 className="font-semibold">계정 생성</h3>
      <div className="grid gap-2">
        <input className="border rounded-lg px-3 py-2" placeholder="이메일" value={f.email} onChange={(e)=>setF({...f,email:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="비밀번호" type="text" value={f.password} onChange={(e)=>setF({...f,password:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="이름" value={f.name} onChange={(e)=>setF({...f,name:e.target.value})} />
        <select className="border rounded-lg px-3 py-2" value={f.role} onChange={(e)=>setF({...f,role:e.target.value as "user"|"super_admin"})}>
          <option value="user">일반 사용자</option>
          <option value="super_admin">슈퍼 관리자</option>
        </select>
        <button className="bg-slate-900 text-white rounded-lg py-2" onClick={submit} disabled={create.isPending}>
          {create.isPending ? "생성 중…" : "계정 생성"}
        </button>
      </div>
      <h3 className="font-semibold">사용자 목록</h3>
      <ul className="divide-y border rounded-lg">
        {(accounts.data ?? []).map((a)=>(
          <li key={a.id} className="flex justify-between px-3 py-2">
            <span>{a.name || "(이름없음)"}</span>
            <span className="text-sm text-slate-500">{a.role === "super_admin" ? "슈퍼관리자" : "일반"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: 빌드 + 수동 검증**

Run: `npm run build` → 성공.
어드민 → 사용자 계정 탭에서 일반 사용자 1명 생성 → 목록에 표시 → 해당 계정으로 로그아웃 후 로그인 가능 확인. 비-슈퍼관리자로 호출 시 403 확인.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 계정 생성 Edge Function 및 계정 관리 탭"
```

---

## Task 10: 발주 데이터 접근 훅

**Files:**
- Create: `src/data/orders.ts`
- Test: `src/data/orders.test.ts`

**Interfaces:**
- Consumes: `supabase`, `Order`, `OrderItem`, `OrderFormInput`(Task 4)
- Produces:
  - `useOrders(filter?)` — orders + 조인 표시명 포함 목록
  - `useOrder(id)` — 단건 + order_items + 표시명
  - `useCreateOrder()`, `useUpdateOrder()`, `useDeleteOrder()`
  - `buildOrderItemsPayload(orderId, items)` 순수 함수
  - 타입 `OrderWithRefs`(목록/상세 표시용: brand_name, model_name, fabric 표기, order_company_name, items[])

- [ ] **Step 1: payload 빌더 테스트**

`src/data/orders.test.ts`:
```ts
import { buildOrderItemsPayload } from "./orders";
test("order_items payload 생성", () => {
  const r = buildOrderItemsPayload("o1", [{ module_id: "m1", quantity: 2 }, { module_id: "m2", quantity: 1 }]);
  expect(r).toEqual([
    { order_id: "o1", module_id: "m1", quantity: 2 },
    { order_id: "o1", module_id: "m2", quantity: 1 },
  ]);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/data/orders.test.ts` → FAIL.

- [ ] **Step 3: 구현**

`src/data/orders.ts`:
```ts
// 발주 CRUD 및 조인 조회 훅
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Order, OrderStatus } from "../types/db";
import type { OrderFormInput } from "../domain/validation";

export interface OrderItemView { module_id: string; module_name: string; quantity: number; }
export interface OrderWithRefs extends Order {
  brand_name: string; model_name: string; fabric_label: string; order_company_name: string;
  items: OrderItemView[];
}

const SELECT = `*,
  brands(name), sofa_models(name), order_companies(name),
  fabrics(name, color, fabric_companies(name)),
  order_items(quantity, module_id, modules(name))`;

function mapRow(r: any): OrderWithRefs {
  return {
    ...r,
    brand_name: r.brands?.name ?? "",
    model_name: r.sofa_models?.name ?? "",
    order_company_name: r.order_companies?.name ?? "",
    fabric_label: r.fabrics ? `${r.fabrics.fabric_companies?.name ?? ""} ${r.fabrics.name}/${r.fabrics.color}` : "",
    items: (r.order_items ?? []).map((it: any) => ({
      module_id: it.module_id, module_name: it.modules?.name ?? "", quantity: it.quantity,
    })),
  };
}

export function useOrders(filter?: { status?: OrderStatus; brand_id?: string; order_company_id?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["orders", filter ?? {}],
    queryFn: async () => {
      let q = supabase.from("orders").select(SELECT).order("due_date", { ascending: true });
      if (filter?.status) q = q.eq("status", filter.status);
      if (filter?.brand_id) q = q.eq("brand_id", filter.brand_id);
      if (filter?.order_company_id) q = q.eq("order_company_id", filter.order_company_id);
      if (filter?.from) q = q.gte("due_date", filter.from);
      if (filter?.to) q = q.lte("due_date", filter.to);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]).map(mapRow);
    },
  });
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: ["orders", "one", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select(SELECT).eq("id", id).single();
      if (error) throw error;
      return mapRow(data);
    },
  });
}

export function buildOrderItemsPayload(orderId: string, items: { module_id: string; quantity: number }[]) {
  return items.map((it) => ({ order_id: orderId, module_id: it.module_id, quantity: it.quantity }));
}

type OrderWrite = Omit<OrderFormInput, "items"> & { status: OrderStatus; note: string; order_date: string; created_by: string };

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order, items }: { order: OrderWrite; items: OrderFormInput["items"] }) => {
      const { data, error } = await supabase.from("orders").insert(order).select("id").single();
      if (error) throw error;
      const { error: e2 } = await supabase.from("order_items").insert(buildOrderItemsPayload(data.id, items));
      if (e2) throw e2;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, order, items }: { id: string; order: Partial<OrderWrite>; items: OrderFormInput["items"] }) => {
      const { error } = await supabase.from("orders").update({ ...order, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      await supabase.from("order_items").delete().eq("order_id", id);
      const { error: e2 } = await supabase.from("order_items").insert(buildOrderItemsPayload(id, items));
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
```

- [ ] **Step 4: 통과 + 빌드**

Run: `npx vitest run src/data/orders.test.ts` → PASS.
Run: `npm run build` → 성공.

- [ ] **Step 5: Commit**

```bash
git add src/data/orders.ts src/data/orders.test.ts
git commit -m "feat: 발주 CRUD 및 조인 조회 훅"
```

---

## Task 11: 발주 등록/수정 폼

**Files:**
- Create: (실제 구현으로 교체) `src/pages/OrderFormPage.tsx`

**Interfaces:**
- Consumes: 마스터 훅(Task 7), 발주 훅(Task 10), `validateOrderForm`(Task 4), `useAuth`, `useToast`
- Produces: 신규/수정 겸용 발주 폼 페이지.

- [ ] **Step 1: 폼 구현**

`src/pages/OrderFormPage.tsx`:
```tsx
// 발주 등록/수정 폼 (브랜드→모델→모듈조합→원단→발주회사→납기→상태→비고)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBrands, useSofaModels, useModules, useFabricCompanies, useFabrics, useOrderCompanies } from "../data/masterData";
import { useOrder, useCreateOrder, useUpdateOrder } from "../data/orders";
import { validateOrderForm } from "../domain/validation";
import { ALL_STATUSES } from "../domain/status";
import { statusLabel } from "../domain/status";
import { useAuth } from "../auth/useAuth";
import { useToast } from "../components/Toast";
import type { OrderStatus } from "../types/db";

export default function OrderFormPage() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const { profile } = useAuth();
  const { show } = useToast();
  const existing = useOrder(id);

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [companyFabricId, setCompanyFabricId] = useState(""); // 원단회사
  const [fabricId, setFabricId] = useState("");
  const [orderCompanyId, setOrderCompanyId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<OrderStatus>("ordered");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({}); // module_id -> quantity

  const brands = useBrands();
  const models = useSofaModels(brandId);
  const modules = useModules(modelId);
  const fabricCompanies = useFabricCompanies();
  const fabrics = useFabrics(companyFabricId);
  const orderCompanies = useOrderCompanies();
  const create = useCreateOrder();
  const update = useUpdateOrder();

  useEffect(() => {
    if (editing && existing.data) {
      const o = existing.data;
      setBrandId(o.brand_id); setModelId(o.model_id); setFabricId(o.fabric_id);
      setOrderCompanyId(o.order_company_id); setDueDate(o.due_date); setStatus(o.status); setNote(o.note);
      setQty(Object.fromEntries(o.items.map((it) => [it.module_id, it.quantity])));
    }
  }, [editing, existing.data]);

  const items = Object.entries(qty).filter(([, q]) => q > 0).map(([module_id, quantity]) => ({ module_id, quantity }));

  async function submit() {
    const errors = validateOrderForm({ brand_id: brandId, model_id: modelId, fabric_id: fabricId, order_company_id: orderCompanyId, due_date: dueDate, items });
    if (errors.length) { show(errors[0], "error"); return; }
    const order = { brand_id: brandId, model_id: modelId, fabric_id: fabricId, order_company_id: orderCompanyId, due_date: dueDate, status, note, order_date: new Date().toISOString().slice(0,10), created_by: profile!.id };
    try {
      if (editing) { await update.mutateAsync({ id: id!, order, items }); show("수정됨"); nav(`/orders/${id}`); }
      else { const newId = await create.mutateAsync({ order, items }); show("발주 등록됨"); nav(`/orders/${newId}`); }
    } catch { show("저장 중 오류가 발생했습니다.", "error"); }
  }

  const field = "border rounded-lg px-3 py-3 w-full";
  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-bold">{editing ? "발주 수정" : "발주 등록"}</h2>

      <label className="block text-sm">브랜드
        <select className={field} value={brandId} onChange={(e)=>{ setBrandId(e.target.value); setModelId(""); }}>
          <option value="">선택</option>
          {(brands.data??[]).map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>

      {brandId && <label className="block text-sm">모델
        <select className={field} value={modelId} onChange={(e)=>{ setModelId(e.target.value); setQty({}); }}>
          <option value="">선택</option>
          {(models.data??[]).map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>}

      {modelId && <div className="space-y-2">
        <p className="text-sm font-medium">모듈 조합 (수량)</p>
        {(modules.data??[]).map((m)=>(
          <div key={m.id} className="flex items-center justify-between gap-2">
            <span>{m.name}</span>
            <input type="number" min={0} className="border rounded-lg px-2 py-2 w-24"
              value={qty[m.id] ?? 0} onChange={(e)=>setQty({ ...qty, [m.id]: Number(e.target.value) })} />
          </div>
        ))}
      </div>}

      <label className="block text-sm">원단회사
        <select className={field} value={companyFabricId} onChange={(e)=>{ setCompanyFabricId(e.target.value); setFabricId(""); }}>
          <option value="">선택</option>
          {(fabricCompanies.data??[]).map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      {companyFabricId && <label className="block text-sm">원단 (이름/색상)
        <select className={field} value={fabricId} onChange={(e)=>setFabricId(e.target.value)}>
          <option value="">선택</option>
          {(fabrics.data??[]).map((f)=><option key={f.id} value={f.id}>{f.name} / {f.color}</option>)}
        </select>
      </label>}

      <label className="block text-sm">발주회사
        <select className={field} value={orderCompanyId} onChange={(e)=>setOrderCompanyId(e.target.value)}>
          <option value="">선택</option>
          {(orderCompanies.data??[]).map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label className="block text-sm">납기일
        <input type="date" className={field} value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
      </label>

      <label className="block text-sm">상태
        <select className={field} value={status} onChange={(e)=>setStatus(e.target.value as OrderStatus)}>
          {ALL_STATUSES.map((s)=><option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </label>

      <label className="block text-sm">비고
        <textarea className={field} rows={3} value={note} onChange={(e)=>setNote(e.target.value)} />
      </label>

      <div className="flex gap-2">
        <button className="bg-slate-900 text-white rounded-lg py-3 px-6 flex-1" onClick={submit}>{editing ? "수정 저장" : "발주 등록"}</button>
        <button className="border rounded-lg py-3 px-6" onClick={()=>nav(-1)}>취소</button>
      </div>
    </div>
  );
}
```
주의: 수정 모드에서 원단회사 셀렉트는 초기 선택을 비워두되, 사용자가 원단회사를 고르면 해당 원단 목록이 로드된다. 기존 `fabric_id`는 유지되어 저장에 사용된다.

- [ ] **Step 2: 빌드 + 수동 검증**

Run: `npm run build` → 성공.
`npm run dev`: 마스터데이터가 있는 상태에서 발주 등록 → 상세로 이동, DB에 orders/order_items 생성 확인. 수정도 확인.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OrderFormPage.tsx
git commit -m "feat: 발주 등록/수정 폼"
```

---

## Task 12: 메인 — 발주 리스트 + 필터

**Files:**
- Create: `src/components/OrderList.tsx`
- Modify: `src/pages/HomePage.tsx`(리스트 부분; 캘린더는 Task 13)

**Interfaces:**
- Consumes: `useOrders`(Task 10), `useBrands`/`useOrderCompanies`, `statusLabel`/`statusColor`, `ALL_STATUSES`
- Produces: `<OrderList filter>` 컴포넌트, 필터 UI를 가진 HomePage(리스트 영역).

- [ ] **Step 1: OrderList 컴포넌트**

`src/components/OrderList.tsx`:
```tsx
// 발주 목록 + 상태/브랜드/발주회사/기간 필터
import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../data/orders";
import { useBrands, useOrderCompanies } from "../data/masterData";
import { ALL_STATUSES, statusLabel, statusColor } from "../domain/status";
import type { OrderStatus } from "../types/db";

export default function OrderList() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [brandId, setBrandId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const brands = useBrands(); const companies = useOrderCompanies();
  const orders = useOrders({
    status: status || undefined, brand_id: brandId || undefined,
    order_company_id: companyId || undefined, from: from || undefined, to: to || undefined,
  });
  const sel = "border rounded-lg px-2 py-2 text-sm";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">발주 리스트</h2>
        <Link to="/orders/new" className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">발주 등록</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <select className={sel} value={status} onChange={(e)=>setStatus(e.target.value as OrderStatus|"")}>
          <option value="">상태 전체</option>
          {ALL_STATUSES.map((s)=><option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select className={sel} value={brandId} onChange={(e)=>setBrandId(e.target.value)}>
          <option value="">브랜드 전체</option>
          {(brands.data??[]).map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className={sel} value={companyId} onChange={(e)=>setCompanyId(e.target.value)}>
          <option value="">발주회사 전체</option>
          {(companies.data??[]).map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className={sel} value={from} onChange={(e)=>setFrom(e.target.value)} />
        <input type="date" className={sel} value={to} onChange={(e)=>setTo(e.target.value)} />
      </div>
      <ul className="divide-y border rounded-lg">
        {(orders.data??[]).map((o)=>(
          <li key={o.id}>
            <Link to={`/orders/${o.id}`} className="flex items-center gap-3 px-3 py-3">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColor(o.status)}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{o.brand_name} {o.model_name}</p>
                <p className="text-xs text-slate-500 truncate">{o.order_company_name} · 납기 {o.due_date}</p>
              </div>
              <span className="text-xs">{statusLabel(o.status)}</span>
            </Link>
          </li>
        ))}
        {orders.data?.length === 0 && <li className="px-3 py-6 text-center text-slate-500 text-sm">발주가 없습니다.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: HomePage에 리스트 배치**

`src/pages/HomePage.tsx`:
```tsx
// 메인 페이지: 캘린더(Task 13) + 발주 리스트
import OrderList from "../components/OrderList";
export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* 캘린더는 Task 13에서 이 위에 추가 */}
      <OrderList />
    </div>
  );
}
```

- [ ] **Step 3: 빌드 + 검증**

Run: `npm run build` → 성공. dev에서 필터 동작 확인.

- [ ] **Step 4: Commit**

```bash
git add src/components/OrderList.tsx src/pages/HomePage.tsx
git commit -m "feat: 발주 리스트 및 필터"
```

---

## Task 13: 메인 — 캘린더(납기일 기준)

**Files:**
- Create: `src/components/OrderCalendar.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `useOrders`, `groupOrdersByDueDate`(Task 4), `statusColor`
- Produces: `<OrderCalendar>` 월간 그리드(납기일에 발주 점 표시, 날짜 클릭 시 해당일 발주 표시).

- [ ] **Step 1: 월 그리드 유틸 테스트**

`src/components/calendarGrid.test.ts`:
```ts
import { monthMatrix } from "./calendarGrid";
test("2026-07 그리드는 7의 배수 셀", () => {
  const cells = monthMatrix(2026, 6); // month 0-based: 6=July
  expect(cells.length % 7).toBe(0);
  expect(cells.some((d) => d?.toISOString().slice(0,10) === "2026-07-01")).toBe(true);
});
```

- [ ] **Step 2: 실패 확인 → 유틸 구현**

Run: `npx vitest run src/components/calendarGrid.test.ts` → FAIL.

`src/components/calendarGrid.ts`:
```ts
// 월간 캘린더 셀(앞뒤 빈칸 포함) 생성 유틸
export function monthMatrix(year: number, month0: number): (Date | null)[] {
  const first = new Date(year, month0, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
```
Run: `npx vitest run src/components/calendarGrid.test.ts` → PASS.

- [ ] **Step 3: 캘린더 컴포넌트**

`src/components/OrderCalendar.tsx`:
```tsx
// 납기일 기준 월간 발주 캘린더
import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../data/orders";
import { groupOrdersByDueDate } from "../domain/calendar";
import { statusColor, statusLabel } from "../domain/status";
import { monthMatrix, ymd } from "./calendarGrid";

export default function OrderCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const orders = useOrders();
  const byDate = groupOrdersByDueDate(orders.data ?? []);
  const cells = monthMatrix(year, month0);
  function prev() { if (month0===0){ setYear(year-1); setMonth0(11);} else setMonth0(month0-1); }
  function next() { if (month0===11){ setYear(year+1); setMonth0(0);} else setMonth0(month0+1); }
  const selectedOrders = selected ? byDate[selected] ?? [] : [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="px-3 py-1 rounded-lg bg-slate-100">◀</button>
        <span className="font-bold">{year}년 {month0+1}월</span>
        <button onClick={next} className="px-3 py-1 rounded-lg bg-slate-100">▶</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["일","월","화","수","목","금","토"].map((d)=><div key={d} className="text-slate-500 py-1">{d}</div>)}
        {cells.map((d, i)=>{
          if (!d) return <div key={i} />;
          const key = ymd(d);
          const dayOrders = byDate[key] ?? [];
          return (
            <button key={i} onClick={()=>setSelected(key)}
              className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-start ${selected===key?"ring-2 ring-slate-900":""}`}>
              <span>{d.getDate()}</span>
              <span className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                {dayOrders.slice(0,4).map((o)=><span key={o.id} className={`w-1.5 h-1.5 rounded-full ${statusColor(o.status)}`} />)}
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="border rounded-lg p-3">
          <p className="font-medium text-sm mb-2">{selected} 납기 발주</p>
          {selectedOrders.length === 0 ? <p className="text-sm text-slate-500">없음</p> :
            <ul className="space-y-1">
              {selectedOrders.map((o)=>(
                <li key={o.id}>
                  <Link to={`/orders/${o.id}`} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${statusColor(o.status)}`} />
                    {o.brand_name} {o.model_name} · {statusLabel(o.status)}
                  </Link>
                </li>
              ))}
            </ul>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: HomePage에 캘린더 추가**

`src/pages/HomePage.tsx`의 주석 위치에 `<OrderCalendar />` 추가(리스트 위). 반응형: `md:grid md:grid-cols-2 md:gap-6`로 캘린더/리스트 분할 가능.

- [ ] **Step 5: 빌드 + 검증**

Run: `npm run build` → 성공. dev에서 납기일에 점 표시, 날짜 클릭 시 해당일 발주 목록 확인.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 납기일 기준 발주 캘린더"
```

---

## Task 14: 발주 상세 페이지

**Files:**
- Create: (실제 구현으로 교체) `src/pages/OrderDetailPage.tsx`

**Interfaces:**
- Consumes: `useOrder`, `useDeleteOrder`, `statusLabel`, `useToast`
- Produces: 상세 보기 + 수정/삭제 버튼 + (PDF 버튼은 Task 15에서 추가).

- [ ] **Step 1: 상세 구현**

`src/pages/OrderDetailPage.tsx`:
```tsx
// 발주 상세: 내용 조회, 수정/삭제 (PDF 버튼은 Task 15에서 추가)
import { useNavigate, useParams, Link } from "react-router-dom";
import { useOrder, useDeleteOrder } from "../data/orders";
import { statusLabel } from "../domain/status";
import { useToast } from "../components/Toast";

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();
  const { data: o, isLoading } = useOrder(id);
  const del = useDeleteOrder();
  if (isLoading) return <div>불러오는 중…</div>;
  if (!o) return <div>발주를 찾을 수 없습니다.</div>;
  const row = "flex justify-between py-2 border-b text-sm";
  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{o.order_no}</h2>
        <span className="text-sm">{statusLabel(o.status)}</span>
      </div>
      <div>
        <div className={row}><span className="text-slate-500">브랜드/모델</span><span>{o.brand_name} {o.model_name}</span></div>
        <div className={row}><span className="text-slate-500">발주회사</span><span>{o.order_company_name}</span></div>
        <div className={row}><span className="text-slate-500">원단</span><span>{o.fabric_label}</span></div>
        <div className={row}><span className="text-slate-500">발주일</span><span>{o.order_date}</span></div>
        <div className={row}><span className="text-slate-500">납기일</span><span>{o.due_date}</span></div>
        <div className="py-2">
          <p className="text-slate-500 text-sm mb-1">모듈 조합</p>
          <ul className="text-sm">
            {o.items.map((it)=><li key={it.module_id} className="flex justify-between"><span>{it.module_name}</span><span>×{it.quantity}</span></li>)}
          </ul>
        </div>
        {o.note && <div className="py-2 text-sm"><p className="text-slate-500 mb-1">비고</p><p>{o.note}</p></div>}
      </div>
      <div className="flex gap-2">
        <Link to={`/orders/${o.id}/edit`} className="border rounded-lg px-4 py-2 text-sm">수정</Link>
        <button className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm"
          onClick={async ()=>{ if(!confirm("삭제할까요?"))return; try{ await del.mutateAsync(o.id); show("삭제됨"); nav("/"); }catch{ show("오류","error"); } }}>삭제</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 + 검증**

Run: `npm run build` → 성공. dev에서 상세/수정 이동/삭제 동작 확인.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OrderDetailPage.tsx
git commit -m "feat: 발주 상세 페이지"
```

---

## Task 15: 발주서 PDF (@react-pdf/renderer + 한글 폰트)

**Files:**
- Create: `src/pdf/OrderSheetDocument.tsx`, `src/pdf/fonts/NotoSansKR-Regular.ttf`, `src/pdf/fonts/NotoSansKR-Bold.ttf`
- Modify: `src/pages/OrderDetailPage.tsx`(PDF 다운로드/인쇄 버튼 추가)

**Interfaces:**
- Consumes: `OrderWithRefs`(Task 10)
- Produces: `<OrderSheetDocument order={...} />`, 다운로드 링크 `<PDFDownloadLink>`.

- [ ] **Step 1: 한글 폰트 추가**

Noto Sans KR Regular/Bold TTF를 `src/pdf/fonts/`에 배치(Google Fonts 다운로드). 라이선스: OFL.

- [ ] **Step 2: PDF 문서 컴포넌트**

`src/pdf/OrderSheetDocument.tsx`:
```tsx
// 한글 발주서 PDF 문서 정의
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import NotoRegular from "./fonts/NotoSansKR-Regular.ttf";
import NotoBold from "./fonts/NotoSansKR-Bold.ttf";
import type { OrderWithRefs } from "../data/orders";
import { statusLabel } from "../domain/status";

Font.register({ family: "Noto", fonts: [{ src: NotoRegular }, { src: NotoBold, fontWeight: "bold" }] });

const s = StyleSheet.create({
  page: { padding: 32, fontFamily: "Noto", fontSize: 11 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  sub: { color: "#666", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1 solid #eee" },
  label: { color: "#666" },
  th: { flexDirection: "row", backgroundColor: "#f1f5f9", paddingVertical: 4, paddingHorizontal: 6, marginTop: 12 },
  td: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottom: "1 solid #eee" },
  c1: { flex: 1 }, c2: { width: 80, textAlign: "right" },
});

export function OrderSheetDocument({ order }: { order: OrderWithRefs }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>사이몬가드얼라이언스 발주서</Text>
        <Text style={s.sub}>{order.order_no}</Text>
        <View style={s.row}><Text style={s.label}>발주회사</Text><Text>{order.order_company_name}</Text></View>
        <View style={s.row}><Text style={s.label}>브랜드/모델</Text><Text>{order.brand_name} {order.model_name}</Text></View>
        <View style={s.row}><Text style={s.label}>원단</Text><Text>{order.fabric_label}</Text></View>
        <View style={s.row}><Text style={s.label}>발주일</Text><Text>{order.order_date}</Text></View>
        <View style={s.row}><Text style={s.label}>납기일</Text><Text>{order.due_date}</Text></View>
        <View style={s.row}><Text style={s.label}>상태</Text><Text>{statusLabel(order.status)}</Text></View>
        <View style={s.th}><Text style={s.c1}>모듈</Text><Text style={s.c2}>수량</Text></View>
        {order.items.map((it) => (
          <View key={it.module_id} style={s.td}><Text style={s.c1}>{it.module_name}</Text><Text style={s.c2}>{it.quantity}</Text></View>
        ))}
        {order.note ? <View style={{ marginTop: 12 }}><Text style={s.label}>비고</Text><Text>{order.note}</Text></View> : null}
      </Page>
    </Document>
  );
}
```
참고: TTF import 타입을 위해 `src/vite-env.d.ts`에 `declare module "*.ttf";` 추가.

- [ ] **Step 3: 상세 페이지에 PDF 버튼**

`src/pages/OrderDetailPage.tsx`의 버튼 영역에 추가:
```tsx
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrderSheetDocument } from "../pdf/OrderSheetDocument";
// ...버튼들 옆에:
<PDFDownloadLink document={<OrderSheetDocument order={o} />} fileName={`${o.order_no}.pdf`}
  className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">
  {({ loading }) => (loading ? "PDF 생성 중…" : "발주서 PDF")}
</PDFDownloadLink>
```
출력(인쇄)은 다운로드한 PDF를 브라우저/뷰어에서 인쇄. 모바일은 다운로드 후 공유 시트로 전달.

- [ ] **Step 4: 빌드 + 검증**

Run: `npm run build` → 성공.
dev에서 발주 상세 → "발주서 PDF" 클릭 → 한글이 정상 표시된 PDF 다운로드 확인.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 한글 발주서 PDF 생성"
```

---

## Task 16: 최종 점검 — 권한/반응형/문서

**Files:**
- Modify: `README.md`(생성), 필요한 미세 수정

**Interfaces:** 없음(통합 점검)

- [ ] **Step 1: 전체 테스트 + 빌드**

Run: `npx vitest run` → 전체 PASS. `npm run build` → 성공.

- [ ] **Step 2: 권한 수동 검증**

일반 사용자로 로그인 → 헤더에 어드민 메뉴 미표시, `/admin` 직접 접근 시 `/`로 리다이렉트. 발주 등록/수정/삭제 가능. 마스터데이터 추가 시도 시 RLS로 차단(오류 토스트).

- [ ] **Step 3: 반응형 수동 검증**

모바일 너비(375px)와 태블릿(768px)에서 로그인/메인(캘린더+리스트)/발주폼/어드민이 깨지지 않는지 확인. 하단 탭(모바일)/상단 메뉴(데스크톱) 전환 확인.

- [ ] **Step 4: README + env 안내**

`README.md`에 설치(`npm install`), `.env` 설정(VITE_SUPABASE_URL/ANON_KEY), 마이그레이션 적용, Edge Function 배포, 최초 슈퍼관리자 시드 절차 기록.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: README 및 최종 점검"
```

---

## Self-Review (작성자 점검 결과)

**1. 스펙 커버리지**
- 로그인 첫 페이지 → Task 5. 캘린더+발주리스트 → Task 12/13. 브랜드별 모듈 소파 조합(등록/수정/삭제) → Task 8(마스터) + Task 11(발주 조합). 원단(회사/명/색상) → Task 8(FabricTab) + Task 11/2(데이터). 발주회사 선택 → Task 8 + Task 11. 어드민(등록/수정/삭제) → Task 8/9. 슈퍼관리자만 계정+마스터 등록 → Task 2(RLS) + Task 9. 발주서 PDF 공유/출력 → Task 15. 모바일/태블릿 최적화 → Task 6 + Task 16. 상태 4단계 → Task 4/전반. 납기일 캘린더 → Task 13. 모든 스펙 항목에 대응 Task 존재.

**2. 플레이스홀더 스캔**: 의도된 "후속 Task에서 교체" 스텁 외에 미구현 placeholder 없음. 각 코드 스텝에 실제 코드 포함.

**3. 타입 일관성**: `OrderFormInput`(domain/validation) → orders 훅에서 재사용. `OrderWithRefs`(orders.ts) → 상세/리스트/캘린더/PDF에서 동일 사용. `OrderStatus`/`Role` 값 전 구간 동일. `statusLabel`/`statusColor`/`ALL_STATUSES`(status.ts) 명칭 일관. `listKey`/`useCreate|Update|Delete`(masterData) 명칭 일관.

---

## Execution Handoff

계획 작성 완료 후 실행 방식을 선택한다(아래 본문 메시지 참조).
