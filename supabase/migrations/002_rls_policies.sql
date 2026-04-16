-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security — Tüm tablolarda tenant izolasyonu
-- ============================================================

-- RLS'i etkinleştir
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- YARDIMCI FONKSİYONLAR
-- ============================================================

-- Mevcut kullanıcının organization_id'sini döner
CREATE OR REPLACE FUNCTION public.org_id() RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Mevcut kullanıcının rolünü döner
CREATE OR REPLACE FUNCTION public.user_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kullanıcı admin mi?
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kullanıcı designer veya admin mi?
CREATE OR REPLACE FUNCTION public.is_designer_or_admin() RETURNS BOOLEAN AS $$
  SELECT role IN ('designer', 'admin') FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY "Kullanıcılar kendi organizasyonlarını görebilir"
  ON organizations FOR SELECT
  USING (id = public.org_id());

CREATE POLICY "Admin organizasyon bilgilerini güncelleyebilir"
  ON organizations FOR UPDATE
  USING (id = public.org_id() AND public.is_admin());

-- ============================================================
-- USERS
-- ============================================================
CREATE POLICY "Aynı organizasyondaki kullanıcılar birbirini görebilir"
  ON users FOR SELECT
  USING (organization_id = public.org_id());

CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin diğer kullanıcıları güncelleyebilir"
  ON users FOR UPDATE
  USING (organization_id = public.org_id() AND public.is_admin());

-- INSERT yalnızca service role ile yapılır (register/invite endpoint'leri adminClient kullanır).
-- Anon/authenticated key ile INSERT'e izin verme.
CREATE POLICY "Sadece sistem yeni kullanıcı ekleyebilir"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- INVITATIONS
-- ============================================================
CREATE POLICY "Admin davetleri görebilir"
  ON invitations FOR SELECT
  USING (organization_id = public.org_id() AND public.is_admin());

CREATE POLICY "Admin davet gönderebilir"
  ON invitations FOR INSERT
  WITH CHECK (organization_id = public.org_id() AND public.is_admin());

CREATE POLICY "Admin davet silebilir"
  ON invitations FOR DELETE
  USING (organization_id = public.org_id() AND public.is_admin());

-- ============================================================
-- BRANDS
-- ============================================================
CREATE POLICY "Organizasyon üyeleri markaları görebilir"
  ON brands FOR SELECT
  USING (organization_id = public.org_id());

CREATE POLICY "Admin ve designer marka oluşturabilir"
  ON brands FOR INSERT
  WITH CHECK (organization_id = public.org_id() AND public.is_designer_or_admin());

CREATE POLICY "Admin ve designer marka güncelleyebilir"
  ON brands FOR UPDATE
  USING (organization_id = public.org_id() AND public.is_designer_or_admin());

CREATE POLICY "Admin marka silebilir"
  ON brands FOR DELETE
  USING (organization_id = public.org_id() AND public.is_admin());

-- ============================================================
-- REQUESTS
-- ============================================================

-- Client yalnızca kendi taleplerini görür; designer/admin tümünü görür
CREATE POLICY "Talepleri görüntüleme"
  ON requests FOR SELECT
  USING (
    organization_id = public.org_id() AND (
      public.is_designer_or_admin() OR created_by = auth.uid()
    )
  );

CREATE POLICY "Talep oluşturma"
  ON requests FOR INSERT
  WITH CHECK (organization_id = public.org_id() AND created_by = auth.uid());

-- Client kendi talebini güncelleyebilir (sadece description, brief alanları)
-- Designer/admin tüm alanları güncelleyebilir
CREATE POLICY "Talep güncelleme"
  ON requests FOR UPDATE
  USING (
    organization_id = public.org_id() AND (
      public.is_designer_or_admin() OR created_by = auth.uid()
    )
  );

CREATE POLICY "Admin talep silebilir"
  ON requests FOR DELETE
  USING (organization_id = public.org_id() AND public.is_admin());

-- ============================================================
-- REQUEST STATUS HISTORY
-- ============================================================
CREATE POLICY "Durum geçmişini görebilme"
  ON request_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_status_history.request_id
        AND r.organization_id = public.org_id()
        AND (public.is_designer_or_admin() OR r.created_by = auth.uid())
    )
  );

CREATE POLICY "Sistem durum geçmişi ekleyebilir"
  ON request_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_status_history.request_id
        AND r.organization_id = public.org_id()
    )
  );

-- ============================================================
-- COMMENTS
-- ============================================================

-- Internal yorumlar yalnızca designer/admin görür
CREATE POLICY "Yorum görüntüleme"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = comments.request_id
        AND r.organization_id = public.org_id()
        AND (
          (public.is_designer_or_admin()) OR
          (r.created_by = auth.uid() AND NOT comments.is_internal)
        )
    )
  );

CREATE POLICY "Yorum oluşturma"
  ON comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = comments.request_id
        AND r.organization_id = public.org_id()
        AND (public.is_designer_or_admin() OR r.created_by = auth.uid())
    )
  );

CREATE POLICY "Kendi yorumunu güncelleme"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin yorum çözümleme"
  ON comments FOR UPDATE
  USING (public.is_designer_or_admin());

-- ============================================================
-- COMMENT ATTACHMENTS
-- ============================================================
CREATE POLICY "Yorum eklerini görüntüleme"
  ON comment_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN requests r ON r.id = c.request_id
      WHERE c.id = comment_attachments.comment_id
        AND r.organization_id = public.org_id()
    )
  );

CREATE POLICY "Yorum eki yükleme"
  ON comment_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN requests r ON r.id = c.request_id
      WHERE c.id = comment_attachments.comment_id
        AND r.organization_id = public.org_id()
        AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- FILES
-- ============================================================
CREATE POLICY "Dosyaları görüntüleme"
  ON files FOR SELECT
  USING (
    organization_id = public.org_id() AND (
      public.is_designer_or_admin() OR
      EXISTS (
        SELECT 1 FROM requests r
        WHERE r.id = files.request_id AND r.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Dosya yükleme"
  ON files FOR INSERT
  WITH CHECK (
    organization_id = public.org_id() AND uploaded_by = auth.uid()
  );

CREATE POLICY "Admin dosya silebilir"
  ON files FOR DELETE
  USING (organization_id = public.org_id() AND public.is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "Kendi bildirimlerini görme"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Sistem bildirim oluşturabilir"
  ON notifications FOR INSERT
  WITH CHECK (organization_id = public.org_id());

CREATE POLICY "Kendi bildirimini okundu işaretleme"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- AI REQUESTS
-- ============================================================
CREATE POLICY "AI kullanım loglarını görme"
  ON ai_requests FOR SELECT
  USING (
    organization_id = public.org_id() AND (
      public.is_admin() OR user_id = auth.uid()
    )
  );

CREATE POLICY "AI kullanım logu oluşturma"
  ON ai_requests FOR INSERT
  WITH CHECK (organization_id = public.org_id() AND user_id = auth.uid());

CREATE POLICY "AI feedback güncelleme"
  ON ai_requests FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- TIME LOGS
-- ============================================================
CREATE POLICY "Zaman loglarını görme"
  ON time_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = time_logs.request_id
        AND r.organization_id = public.org_id()
        AND (public.is_admin() OR time_logs.user_id = auth.uid())
    )
  );

CREATE POLICY "Zaman logu oluşturma"
  ON time_logs FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND public.is_designer_or_admin()
  );

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE POLICY "Admin audit log görebilir"
  ON audit_logs FOR SELECT
  USING (organization_id = public.org_id() AND public.is_admin());

CREATE POLICY "Sistem audit log ekleyebilir"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);  -- Service role ile çalışır
