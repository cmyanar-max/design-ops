-- ============================================================
-- 003_indexes.sql
-- Performans indeksleri
-- ============================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Users
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(organization_id, role);

-- Invitations
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(organization_id, email);

-- Brands
CREATE INDEX idx_brands_organization ON brands(organization_id);

-- Requests (en kritik indeksler — Kanban sorguları)
CREATE INDEX idx_requests_organization_status ON requests(organization_id, status);
CREATE INDEX idx_requests_organization_assigned ON requests(organization_id, assigned_to);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_organization_created ON requests(organization_id, created_at DESC);
CREATE INDEX idx_requests_deadline ON requests(organization_id, deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_requests_brand ON requests(brand_id) WHERE brand_id IS NOT NULL;

-- Full text search için tsvector
CREATE INDEX idx_requests_fts ON requests USING GIN (
  to_tsvector('turkish', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

-- Request Status History
CREATE INDEX idx_status_history_request ON request_status_history(request_id, created_at DESC);

-- Comments
CREATE INDEX idx_comments_request ON comments(request_id, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_user ON comments(user_id);

-- Files
CREATE INDEX idx_files_request ON files(request_id, created_at DESC);
CREATE INDEX idx_files_organization ON files(organization_id);

-- Notifications (en sık erişilen: okunmamış sayısı)
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- AI Requests
CREATE INDEX idx_ai_requests_organization ON ai_requests(organization_id, created_at DESC);
CREATE INDEX idx_ai_requests_user ON ai_requests(user_id);

-- Time Logs
CREATE INDEX idx_time_logs_request ON time_logs(request_id);
CREATE INDEX idx_time_logs_user ON time_logs(user_id, logged_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
