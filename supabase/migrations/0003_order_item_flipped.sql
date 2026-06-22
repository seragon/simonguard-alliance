-- 모듈 이미지 좌우 반전 여부 컬럼 추가 및 발주 쓰기 RPC 갱신

-- 1. order_items 에 flipped 컬럼 추가
alter table order_items add column if not exists flipped boolean not null default false;

-- 2. create_order_with_items: flipped 포함하도록 재정의
create or replace function create_order_with_items(p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  insert into orders (brand_id, model_id, fabric_id, order_company_id, order_date, due_date, status, note, created_by)
  values (
    (p_order->>'brand_id')::uuid,
    (p_order->>'model_id')::uuid,
    (p_order->>'fabric_id')::uuid,
    (p_order->>'order_company_id')::uuid,
    (p_order->>'order_date')::date,
    (p_order->>'due_date')::date,
    (p_order->>'status')::text,
    (p_order->>'note')::text,
    (p_order->>'created_by')::uuid
  )
  returning id into v_id;

  insert into order_items (order_id, module_id, quantity, flipped)
  select
    v_id,
    (elem->>'module_id')::uuid,
    (elem->>'quantity')::int,
    coalesce((elem->>'flipped')::boolean, false)
  from jsonb_array_elements(p_items) as elem;

  return v_id;
end;
$$;

-- 3. update_order_with_items: flipped 포함하도록 재정의
create or replace function update_order_with_items(p_id uuid, p_order jsonb, p_items jsonb)
returns void
language plpgsql
security invoker
as $$
begin
  update orders set
    brand_id          = (p_order->>'brand_id')::uuid,
    model_id          = (p_order->>'model_id')::uuid,
    fabric_id         = (p_order->>'fabric_id')::uuid,
    order_company_id  = (p_order->>'order_company_id')::uuid,
    order_date        = (p_order->>'order_date')::date,
    due_date          = (p_order->>'due_date')::date,
    status            = (p_order->>'status')::text,
    note              = (p_order->>'note')::text,
    updated_at        = now()
  where id = p_id;

  delete from order_items where order_id = p_id;

  insert into order_items (order_id, module_id, quantity, flipped)
  select
    p_id,
    (elem->>'module_id')::uuid,
    (elem->>'quantity')::int,
    coalesce((elem->>'flipped')::boolean, false)
  from jsonb_array_elements(p_items) as elem;
end;
$$;
