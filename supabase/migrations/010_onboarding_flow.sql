-- ============================================================
-- 010_onboarding_flow.sql
-- Rol seçimli onboarding akışı: join_requests + pending_approval
-- ============================================================

-- Kullanıcı ilk kayıt olduğunda henüz organizasyonu olmayabilir
ALTER TABLE users ALTER COLUMN organization_id DROP NOT NULL;

-- Yeni status değeri: join isteği onay bekliyor
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('active', 'invited', 'suspended', 'deactivated', 'pending_approval'));

-- ============================================================
-- JOIN REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS join_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'designer', 'client')),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

CREATE INDEX IF NOT EXISTS join_requests_org_status_idx
  ON join_requests (org_id, status);
CREATE INDEX IF NOT EXISTS join_requests_user_idx
  ON join_requests (user_id);

CREATE TRIGGER join_requests_updated_at
  BEFORE UPDATE ON join_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- Admin kendi organizasyonuna gelen istekleri görür
CREATE POLICY "Admin join isteklerini görebilir"
  ON join_requests FOR SELECT
  USING (org_id = public.org_id() AND public.is_admin());

-- Kullanıcı kendi gönderdiği isteği görebilir
CREATE POLICY "Kullanıcı kendi join isteğini görebilir"
  ON join_requests FOR SELECT
  USING (user_id = auth.uid());

-- Admin istekleri güncelleyebilir (approve/reject)
CREATE POLICY "Admin join isteklerini güncelleyebilir"
  ON join_requests FOR UPDATE
  USING (org_id = public.org_id() AND public.is_admin());

-- INSERT service role üzerinden yapılır; genel izin kapalı kalıyor.
