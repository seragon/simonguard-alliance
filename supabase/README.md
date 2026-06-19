# Supabase 마이그레이션 안내

이 디렉터리에는 사이몬가드얼라이언스 소파 발주 앱의 PostgreSQL 스키마와 RLS 정책이 담겨 있습니다.

## 마이그레이션 적용 방법

Supabase 프로젝트가 준비되면 아래 두 가지 방법 중 하나로 적용합니다.

### 방법 1: Supabase 대시보드 SQL Editor

1. Supabase 프로젝트 대시보드에 접속합니다.
2. 좌측 메뉴에서 **SQL Editor**를 선택합니다.
3. `supabase/migrations/0001_init.sql` 파일 전체 내용을 복사하여 에디터에 붙여 넣습니다.
4. **Run** 버튼을 클릭합니다.
5. 에러 없이 완료되면 9개 테이블과 RLS 정책이 생성됩니다.
6. 이어서 `supabase/migrations/0002_order_write_rpc.sql`도 동일하게 실행합니다. 발주 원자 쓰기에 필요한 `create_order_with_items`, `update_order_with_items` 함수가 등록됩니다.

확인 쿼리.
```sql
select count(*) from brands;
-- 결과: 0 (테이블 생성 성공)
```

### 방법 2: Supabase CLI

```bash
# 프로젝트 루트에서 실행
supabase link --project-ref <your-project-ref>
supabase db push
```

## 최초 슈퍼관리자 시드

마이그레이션 적용 후 첫 번째 슈퍼관리자 계정을 설정합니다.

1. Supabase 대시보드 **Authentication** 메뉴에서 사용자를 1명 생성합니다.
2. 생성된 사용자의 UUID를 복사합니다.
3. SQL Editor에서 아래 쿼리를 실행합니다.

```sql
update profiles
set role = 'super_admin', name = '관리자'
where id = '<생성된 uuid>';
-- 결과: 1 row updated
```

## 스키마 개요

| 테이블 | 설명 |
|---|---|
| `profiles` | 인증 사용자 프로필 (role: user / super_admin) |
| `brands` | 소파 브랜드 마스터 |
| `sofa_models` | 소파 모델 마스터 |
| `modules` | 소파 모듈(구성요소) 마스터 |
| `fabric_companies` | 원단 업체 마스터 |
| `fabrics` | 원단 마스터 |
| `order_companies` | 발주처 마스터 |
| `orders` | 발주 주문 |
| `order_items` | 발주 주문 라인 아이템 |

## RLS 정책 요약

- **profiles**: 본인 행만 조회 가능. 슈퍼관리자는 전체 관리 가능.
- **브랜드/모델/모듈/원단 관련 테이블 (6개)**: 인증된 사용자는 조회 가능. 슈퍼관리자만 쓰기 가능.
- **orders / order_items**: 인증된 사용자라면 전체 CRUD 가능.
