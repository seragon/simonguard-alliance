-- 초기 관리자 계정 생성: admin / 1818
-- 실행 전 기존 계정 삭제:
--   DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@simonguard.local');
--   DELETE FROM auth.users WHERE email = 'admin@simonguard.local';

DO $$
DECLARE
  v_uid uuid := gen_random_uuid();
BEGIN
  -- auth.users 삽입
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_uid, 'authenticated', 'authenticated',
    'admin@simonguard.local',
    crypt('1818', gen_salt('bf')),
    now(),
    '{"name":"관리자","role":"super_admin","username":"admin"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    now(), now(), '', '', '', ''
  );

  -- auth.identities 삽입 (provider_id = 신버전, id = 구버전 — 둘 다 시도)
  BEGIN
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', 'admin@simonguard.local'),
      'email', now(), now(), now()
    );
  EXCEPTION WHEN undefined_column THEN
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', 'admin@simonguard.local'),
      'email', now(), now(), now()
    );
  END;

  -- profiles 생성 (트리거 실패 대비)
  INSERT INTO public.profiles (id, name, role)
  VALUES (v_uid, '관리자', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', name = '관리자';

  RAISE NOTICE '완료 — admin / 1818';
END $$;
