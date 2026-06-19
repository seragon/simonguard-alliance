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
