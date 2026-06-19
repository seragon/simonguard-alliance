-- 발주 원자 쓰기 RPC (create_order_with_items, update_order_with_items)

-- 발주 + 라인아이템 원자 등록 함수
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

  insert into order_items (order_id, module_id, quantity)
  select
    v_id,
    (elem->>'module_id')::uuid,
    (elem->>'quantity')::int
  from jsonb_array_elements(p_items) as elem;

  return v_id;
end;
$$;

-- 발주 + 라인아이템 원자 수정 함수
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

  insert into order_items (order_id, module_id, quantity)
  select
    p_id,
    (elem->>'module_id')::uuid,
    (elem->>'quantity')::int
  from jsonb_array_elements(p_items) as elem;
end;
$$;
