-- security definer 함수에 set search_path = '' 추가 (Supabase 보안 요건)
-- 미설정 시 트리거 실행 실패 → "Database error creating new user" 발생

create or replace function is_super_admin()
returns boolean language sql security definer stable
set search_path = '' as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end; $$;
