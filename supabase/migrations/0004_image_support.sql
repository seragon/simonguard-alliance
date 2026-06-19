-- 모듈·원단·회사 이미지 등록 지원 (image_url 컬럼 + Storage 버킷)

alter table modules          add column if not exists image_url text;
alter table fabrics          add column if not exists image_url text;
alter table fabric_companies add column if not exists image_url text;
alter table order_companies  add column if not exists image_url text;

-- 공개 Storage 버킷 생성
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- Storage RLS 정책
create policy "인증 사용자 에셋 조회"
on storage.objects for select to authenticated
using (bucket_id = 'assets');

create policy "슈퍼관리자 에셋 업로드"
on storage.objects for insert to authenticated
with check (bucket_id = 'assets' and public.is_super_admin());

create policy "슈퍼관리자 에셋 수정"
on storage.objects for update to authenticated
using (bucket_id = 'assets' and public.is_super_admin());

create policy "슈퍼관리자 에셋 삭제"
on storage.objects for delete to authenticated
using (bucket_id = 'assets' and public.is_super_admin());
