-- profiles 테이블에 username 컬럼 추가 및 트리거 갱신

alter table profiles add column if not exists username text unique;

-- handle_new_user 트리거: username도 메타데이터에서 읽도록 갱신
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, role, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'username', null)
  );
  return new;
end; $$;
