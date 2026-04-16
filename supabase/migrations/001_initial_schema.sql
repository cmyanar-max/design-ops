-- ============================================================
-- 001_initial_schema.sql
-- AI DesignOps Platform - Tam Veritabanı Şeması
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ORGANIZATIONS (SaaS multi-tenancy temeli)
-- ============================================================
CREATE TABLE organizations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  slug                    TEXT UNIQUE NOT NULL,
  logo_url                TEXT,
  plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  subscription_status     TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  trial_ends_at           TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  monthly_request_limit   INTEGER DEFAULT 10,
  storage_limit_gb        NUMERIC(8,2) DEFAULT 1.0,
  ai_credits_limit        INTEGER DEFAULT 50,
  ai_credits_used         INTEGER DEFAULT 0,
  settings                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS (auth.users ile bağlantılı)
-- ============================================================
CREATE TABLE users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  role                  TEXT NOT NULL CHECK (role IN ('admin', 'designer', 'client')),
  avatar_url            TEXT,
  phone                 TEXT,
  timezone              TEXT DEFAULT 'Europe/Istanbul',
  locale                TEXT DEFAULT 'tr',
  status                TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'deactivated')),
  notification_prefs    JSONB DEFAULT '{"email": true, "in_app": true}',
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  last_login_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, organization_id)
);

-- ============================================================
-- INVITATIONS (ekip davet sistemi)
-- ============================================================
CREATE TABLE invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'designer', 'client')),
  invited_by      UUID NOT NULL REFERENCES users(id),
  token           TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRANDS (marka rehberi — AI context için kritik)
-- ============================================================
CREATE TABLE brands (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  primary_color         TEXT,
  secondary_color       TEXT,
  accent_color          TEXT,
  font_primary          TEXT,
  font_secondary        TEXT,
  logo_url              TEXT,
  brand_guidelines_url  TEXT,
  tone_of_voice         TEXT,
  target_audience       TEXT,
  guidelines_text       TEXT,  -- AI context için parse edilmiş metin
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REQUESTS (tasarım talepleri — core iş akışı)
-- ============================================================
CREATE TABLE requests (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_id                    UUID REFERENCES brands(id),
  title                       TEXT NOT NULL,
  description                 TEXT,
  request_type                TEXT NOT NULL CHECK (request_type IN (
    'social_post', 'banner', 'logo', 'video', 'presentation',
    'email_template', 'brochure', 'infographic', 'other'
  )),
  status                      TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'brief_review', 'design', 'revision', 'approval', 'completed', 'archived', 'cancelled'
  )),
  priority                    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deadline                    DATE,
  estimated_hours             NUMERIC(6,2),
  actual_hours                NUMERIC(6,2),
  revision_count              INTEGER DEFAULT 0,
  ai_brief_score              NUMERIC(4,2),  -- 0-100 AI kalite skoru
  ai_brief_suggestions        JSONB,          -- cache'lenmiş AI önerileri
  tags                        TEXT[] DEFAULT '{}',
  created_by                  UUID NOT NULL REFERENCES users(id),
  assigned_to                 UUID REFERENCES users(id),
  approved_by                 UUID REFERENCES users(id),
  started_at                  TIMESTAMPTZ,
  submitted_for_approval_at   TIMESTAMPTZ,
  approved_at                 TIMESTAMPTZ,
  completed_at                TIMESTAMPTZ,
  cancelled_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REQUEST STATUS HISTORY (durum geçiş logu)
-- ============================================================
CREATE TABLE request_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_by  UUID NOT NULL REFERENCES users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMENTS (threaded yorum sistemi)
-- ============================================================
CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES comments(id),  -- threaded replies
  user_id       UUID NOT NULL REFERENCES users(id),
  body          TEXT NOT NULL,
  comment_type  TEXT DEFAULT 'general' CHECK (comment_type IN (
    'general', 'revision_request', 'approval', 'rejection', 'ai_suggestion'
  )),
  is_internal   BOOLEAN DEFAULT FALSE,  -- sadece designer/admin görür
  is_resolved   BOOLEAN DEFAULT FALSE,
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES users(id),
  ai_generated  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMENT ATTACHMENTS
-- ============================================================
CREATE TABLE comment_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id    UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  filename      TEXT NOT NULL,
  file_size     BIGINT,
  mime_type     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FILES (dosya yönetimi + versiyonlama)
-- ============================================================
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_id      UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,   -- Supabase Storage private bucket path
  file_url        TEXT,            -- imzalı URL (kısa süreli)
  mime_type       TEXT,
  file_size       BIGINT,
  file_type       TEXT NOT NULL CHECK (file_type IN (
    'logo', 'image', 'pdf', 'font', 'guideline',
    'design_output', 'ai_generated', 'other'
  )),
  version         INTEGER DEFAULT 1,
  parent_file_id  UUID REFERENCES files(id),  -- önceki versiyon
  is_final        BOOLEAN DEFAULT FALSE,
  ai_generated    BOOLEAN DEFAULT FALSE,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS (in-app bildirim merkezi)
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN (
    'request_assigned', 'status_changed', 'comment_added',
    'revision_requested', 'approved', 'mention', 'deadline_reminder'
  )),
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',  -- {request_id, comment_id, ...}
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI REQUESTS (AI kullanım takibi + billing)
-- ============================================================
CREATE TABLE ai_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id),
  request_id        UUID REFERENCES requests(id),
  feature           TEXT NOT NULL CHECK (feature IN (
    'brief_analysis', 'design_suggestion', 'moodboard',
    'revision_suggestion', 'brand_check'
  )),
  model             TEXT NOT NULL,
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  total_tokens      INTEGER,
  latency_ms        INTEGER,
  status            TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message     TEXT,
  feedback          SMALLINT CHECK (feedback IN (-1, 1)),  -- thumbs down / up
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TIME LOGS (designer zaman takibi)
-- ============================================================
CREATE TABLE time_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  hours       NUMERIC(6,2) NOT NULL CHECK (hours > 0),
  description TEXT,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS (enterprise compliance)
-- ============================================================
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  action          TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'deleted', 'status_changed',
    'assigned', 'file_uploaded', 'login', 'invited'
  )),
  resource_type   TEXT NOT NULL CHECK (resource_type IN (
    'request', 'comment', 'file', 'user', 'brand', 'organization'
  )),
  resource_id     UUID NOT NULL,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TETİKLEYİCİLERİ
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
