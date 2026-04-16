-- ============================================================
-- TEST KULLANICILARI — Supabase SQL Editor'da çalıştırın
-- Önce çalıştırmadan önce mevcut test verisi varsa temizler.
-- ============================================================

-- Sabit UUID'ler (her çalıştırmada aynı kalır)
DO $$
DECLARE
  v_org_id      UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_admin_id    UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_designer_id UUID := 'bbbbbbbb-0000-0000-0000-000000000002';
  v_client_id   UUID := 'bbbbbbbb-0000-0000-0000-000000000003';
  v_brand_id    UUID := 'cccccccc-0000-0000-0000-000000000001';
BEGIN

-- ── 1. Eski test verisini temizle ──────────────────────────────
DELETE FROM public.requests      WHERE organization_id = v_org_id;
DELETE FROM public.brands        WHERE organization_id = v_org_id;
DELETE FROM public.notifications WHERE organization_id = v_org_id;
DELETE FROM public.users         WHERE organization_id = v_org_id;
DELETE FROM public.organizations WHERE id = v_org_id;
DELETE FROM auth.identities      WHERE user_id IN (v_admin_id, v_designer_id, v_client_id);
DELETE FROM auth.users           WHERE id IN (v_admin_id, v_designer_id, v_client_id);

-- ── 2. Organizasyon ────────────────────────────────────────────
INSERT INTO public.organizations (
  id, name, slug, plan, subscription_status,
  monthly_request_limit, ai_credits_limit, ai_credits_used
) VALUES (
  v_org_id, 'Acme Design Studio', 'acme-design',
  'pro', 'active', 999, 999, 0
);

-- ── 3. Auth kullanıcıları (şifre: Test1234!) ──────────────────
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  aud, role, created_at, updated_at
) VALUES
  (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated', NOW(), NOW()
  ),
  (
    v_designer_id,
    '00000000-0000-0000-0000-000000000000',
    'tasarimci@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated', NOW(), NOW()
  ),
  (
    v_client_id,
    '00000000-0000-0000-0000-000000000000',
    'musteri@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated', NOW(), NOW()
  );

-- ── 3b. Auth identities (e-posta girişi için zorunlu) ─────────
DELETE FROM auth.identities WHERE user_id IN (v_admin_id, v_designer_id, v_client_id);
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES
  (
    gen_random_uuid(), v_admin_id, 'admin@test.com',
    json_build_object('sub', v_admin_id::text, 'email', 'admin@test.com'),
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(), v_designer_id, 'tasarimci@test.com',
    json_build_object('sub', v_designer_id::text, 'email', 'tasarimci@test.com'),
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(), v_client_id, 'musteri@test.com',
    json_build_object('sub', v_client_id::text, 'email', 'musteri@test.com'),
    'email', NOW(), NOW(), NOW()
  );

-- ── 4. Public kullanıcı kayıtları ─────────────────────────────
INSERT INTO public.users (
  id, organization_id, name, email, role, onboarding_completed, status
) VALUES
  (v_admin_id,    v_org_id, 'Cem Yönetici',  'admin@test.com',      'admin',    TRUE, 'active'),
  (v_designer_id, v_org_id, 'Mert Tasarımcı','tasarimci@test.com',  'designer', TRUE, 'active'),
  (v_client_id,   v_org_id, 'Ayşe Müşteri',  'musteri@test.com',    'client',   TRUE, 'active');

-- ── 5. Örnek marka ────────────────────────────────────────────
INSERT INTO public.brands (
  id, organization_id, name, primary_color, secondary_color,
  font_primary, tone_of_voice, target_audience, created_by
) VALUES (
  v_brand_id, v_org_id, 'AcmeFashion',
  '#E84A5F', '#FFD97D', 'Syne Bold',
  'Enerjik, modern, genç',
  '18–35 yaş, kadın, moda takipçisi',
  v_admin_id
);

-- ── 6. Örnek talepler ─────────────────────────────────────────
INSERT INTO public.requests (
  id, organization_id, brand_id, title, description,
  request_type, status, priority, deadline,
  estimated_hours, tags, created_by, assigned_to, ai_brief_score
) VALUES
  (
    gen_random_uuid(), v_org_id, v_brand_id,
    'Instagram Kampanya Görselleri — Yaz Koleksiyonu',
    E'Hedef kitle: 18–35 yaş, kadın\nKullanım: Instagram feed (1080×1080) + story (1080×1920)\nTon: Enerjik, yaz temalı\n\nİçerik:\n• Görsel 1 — "Yaz Koleksiyonu" başlığı + hero ürün\n• Görsel 2 — %30 indirim vurgusu\n• Görsel 3 — CTA butonu\n\nRenkler: Marka renkleri + kum sarısı\nFont: Syne Bold başlıklar, Inter body',
    'social_post', 'design', 'high', CURRENT_DATE + 9,
    6, ARRAY['instagram','yaz'], v_client_id, v_designer_id, 87
  ),
  (
    gen_random_uuid(), v_org_id, NULL,
    'Ana Sayfa Hero Banner — Mayıs Kampanyası',
    E'Kullanım: Web sitesi ana sayfa hero (1440×600 px + mobil)\nBaşlık: "Yenile & Kazan — Mayıs Boyunca %40 İndirim"\nCTA: "Kampanyayı Gör" (turuncu)\n\nGörsel yön: Sağda ürün kolajı, solda metin\nTon: Acil, kampanya hissi',
    'banner', 'brief_review', 'urgent', CURRENT_DATE + 4,
    4, ARRAY['web','kampanya'], v_client_id, NULL, 42
  ),
  (
    gen_random_uuid(), v_org_id, v_brand_id,
    'Ürün Kataloğu — Broşür Tasarımı',
    E'Baskı kataloğu — 2026 yaz ürün serisi\nEbat: A4, çift taraflı, 16 sayfa\nBaskı: Kuşe 170gr, mat sele, CMYK\n\nİçerik: Kapak + koleksiyon hikayesi + ürün sayfaları + fiyat listesi\n\nTüm ürün görselleri paylaşıldı.',
    'brochure', 'approval', 'medium', CURRENT_DATE + 19,
    12, ARRAY['baskı','katalog'], v_client_id, v_designer_id, 93
  ),
  (
    gen_random_uuid(), v_org_id, NULL,
    'Kurumsal Sunum Şablonu — Q2 2026',
    E'Q2 yatırımcı sunumu\n~20 slayt, PowerPoint + PDF\n\nKoyu lacivert + altın aksanlar\nFont: Inter\n\nRevizyon: Slide 4–7 grafikler yeniden düzenlenecek.',
    'presentation', 'revision', 'medium', CURRENT_DATE + 14,
    8, ARRAY['kurumsal','sunum'], v_client_id, v_designer_id, 71
  ),
  (
    gen_random_uuid(), v_org_id, NULL,
    'LinkedIn Şirket Profil Görseli',
    E'LinkedIn kapak görseli yenileme\nEbat: 1128×191 px\n\nMesaj: "AI destekli tasarım süreçleri"\nTon: Profesyonel, teknoloji şirketi hissi',
    'social_post', 'new', 'low', NULL,
    2, ARRAY['linkedin'], v_client_id, NULL, 55
  ),
  (
    gen_random_uuid(), v_org_id, NULL,
    'E-Bülten Şablonu — Nisan 2026',
    E'Aylık e-bülten HTML şablonu\nE-posta istemcileri: Gmail, Outlook, Apple Mail\nGenişlik: 600px\n\nBölümler: Header + haber + ürün spotlight + footer',
    'email_template', 'completed', 'medium', CURRENT_DATE - 1,
    5, ARRAY['email'], v_client_id, v_designer_id, 78
  );

END $$;
