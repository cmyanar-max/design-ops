-- ============================================================
-- 014_all_users_see_all_requests.sql
-- Tüm organizasyon üyeleri, kendi org'larındaki tüm talepleri
-- görebilsin (Kanban dahil). Önceki policy yalnızca
-- designer/admin veya created_by = auth.uid() izni veriyordu.
-- ============================================================

-- Requests: SELECT politikasını güncelle
DROP POLICY IF EXISTS "Talepleri görüntüleme" ON requests;

CREATE POLICY "Talepleri görüntüleme"
  ON requests FOR SELECT
  USING (organization_id = public.org_id());

-- Request status history: SELECT politikasını da güncelle
DROP POLICY IF EXISTS "Durum geçmişini görebilme" ON request_status_history;

CREATE POLICY "Durum geçmişini görebilme"
  ON request_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_status_history.request_id
        AND r.organization_id = public.org_id()
    )
  );
