-- ============================================================
-- test_users.sql — Test kullanıcıları (Supabase SQL Editor'da çalıştır)
-- ============================================================
-- ÖNCE: Supabase Dashboard → Authentication → Providers → Email
--       "Confirm email" toggle'ını KAPAT (ya da bu script yeterli)
-- ============================================================

-- 3 farklı rol için test kullanıcıları:
--   admin@test.com    / Test1234!  → admin
--   designer@test.com / Test1234!  → designer
--   client@test.com   / Test1234!  → client

DO $$
DECLARE
  org_id UUID := '00000000-0000-0000-0000-000000000001';
  admin_id UUID := '00000000-0000-0000-0000-000000000101';
  designer_id UUID := '00000000-0000-0000-0000-000000000102';
  client_id UUID := '00000000-0000-0000-0000-000000000103';
BEGIN

  -- ── 1. auth.users ──────────────────────────────────────────
  -- Admin
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin Kullanıcı"}',
    NOW(), NOW(),
    '', '', '', ''
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Test1234!', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- Designer
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    designer_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'designer@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Tasarımcı Kullanıcı"}',
    NOW(), NOW(),
    '', '', '', ''
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Test1234!', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- Client
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    client_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'client@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Müşteri Kullanıcı"}',
    NOW(), NOW(),
    '', '', '', ''
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Test1234!', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- ── 2. auth.identities (Supabase zorunlu tutar) ────────────
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  ) VALUES
    (gen_random_uuid(), admin_id, 'admin@test.com', 'email',
     jsonb_build_object('sub', admin_id::text, 'email', 'admin@test.com'),
     NOW(), NOW(), NOW()),
    (gen_random_uuid(), designer_id, 'designer@test.com', 'email',
     jsonb_build_object('sub', designer_id::text, 'email', 'designer@test.com'),
     NOW(), NOW(), NOW()),
    (gen_random_uuid(), client_id, 'client@test.com', 'email',
     jsonb_build_object('sub', client_id::text, 'email', 'client@test.com'),
     NOW(), NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- ── 3. public.users ────────────────────────────────────────
  INSERT INTO public.users (
    id, organization_id, name, email, role,
    status, onboarding_completed, created_at, updated_at
  ) VALUES
    (admin_id, org_id, 'Admin Kullanıcı', 'admin@test.com', 'admin',
     'active', TRUE, NOW(), NOW()),
    (designer_id, org_id, 'Tasarımcı Kullanıcı', 'designer@test.com', 'designer',
     'active', TRUE, NOW(), NOW()),
    (client_id, org_id, 'Müşteri Kullanıcı', 'client@test.com', 'client',
     'active', TRUE, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    onboarding_completed = TRUE,
    status = 'active';

END $$;

-- ── Kontrol sorgusu ─────────────────────────────────────────
SELECT
  au.email,
  au.email_confirmed_at IS NOT NULL AS confirmed,
  pu.role,
  pu.organization_id
FROM auth.users au
JOIN public.users pu ON pu.id = au.id
WHERE au.email IN ('admin@test.com', 'designer@test.com', 'client@test.com');
