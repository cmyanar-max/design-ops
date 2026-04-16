-- ============================================================
-- seed.sql — Geliştirme ortamı test verisi
-- ============================================================
-- NOT: Bu dosyayı yalnızca local geliştirme ortamında çalıştır

-- Test organizasyonu
INSERT INTO organizations (id, name, slug, plan, subscription_status, monthly_request_limit, ai_credits_limit)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Ajans',
  'demo-ajansi',
  'pro',
  'active',
  100,
  500
);

-- Markalar
INSERT INTO brands (id, organization_id, name, primary_color, secondary_color, font_primary, tone_of_voice, target_audience)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Ana Marka',
  '#6366F1',
  '#EC4899',
  'Inter',
  'Profesyonel ve güvenilir',
  '25-45 yaş, teknoloji meraklısı'
);
