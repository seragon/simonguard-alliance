-- 브랜드 로고 이미지 지원
alter table brands add column if not exists image_url text;
