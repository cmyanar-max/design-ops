-- ============================================================
-- 004_functions.sql
-- Dashboard ve iş mantığı Postgres fonksiyonları
-- ============================================================

-- ============================================================
-- Ortalama teslim süresi (gün cinsinden)
-- ============================================================
CREATE OR REPLACE FUNCTION get_avg_delivery_time(p_org_id UUID)
RETURNS NUMERIC AS $$
  SELECT ROUND(AVG(
    EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400
  ), 1)
  FROM requests
  WHERE organization_id = p_org_id
    AND status = 'completed'
    AND completed_at IS NOT NULL
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- Dashboard özet istatistikleri
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_org_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_requests',     COUNT(*),
    'new_requests',       COUNT(*) FILTER (WHERE status = 'new'),
    'active_designs',     COUNT(*) FILTER (WHERE status IN ('brief_review', 'design')),
    'in_revision',        COUNT(*) FILTER (WHERE status = 'revision'),
    'pending_approvals',  COUNT(*) FILTER (WHERE status = 'approval'),
    'completed',          COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled',          COUNT(*) FILTER (WHERE status = 'cancelled'),
    'avg_delivery_days',  get_avg_delivery_time(p_org_id),
    'avg_revisions',      ROUND(AVG(revision_count), 1)
  )
  FROM requests
  WHERE organization_id = p_org_id
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- Talep tipi dağılımı (grafik için)
-- ============================================================
CREATE OR REPLACE FUNCTION get_requests_by_type(p_org_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
  SELECT json_agg(
    json_build_object('type', request_type, 'count', cnt)
    ORDER BY cnt DESC
  )
  FROM (
    SELECT request_type, COUNT(*) as cnt
    FROM requests
    WHERE organization_id = p_org_id
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY request_type
  ) sub
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- Designer iş yükü (aktif talep sayısı)
-- ============================================================
CREATE OR REPLACE FUNCTION get_designer_workload(p_org_id UUID)
RETURNS JSON AS $$
  SELECT json_agg(row_to_json(sub) ORDER BY sub.active DESC)
  FROM (
    SELECT
      u.id AS user_id,
      u.name,
      u.avatar_url,
      COUNT(r.id) FILTER (WHERE r.status NOT IN ('completed', 'cancelled', 'archived')) AS active,
      COUNT(r.id) FILTER (WHERE r.status = 'completed') AS completed,
      COALESCE(SUM(tl.hours), 0) AS total_hours
    FROM users u
    LEFT JOIN requests r ON r.assigned_to = u.id AND r.organization_id = p_org_id
    LEFT JOIN time_logs tl ON tl.user_id = u.id AND tl.request_id = r.id
    WHERE u.organization_id = p_org_id AND u.role = 'designer'
    GROUP BY u.id, u.name, u.avatar_url
  ) sub
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- Talep status geçişini güncelle (revision_count artışı dahil)
-- ============================================================
CREATE OR REPLACE FUNCTION transition_request_status(
  p_request_id UUID,
  p_new_status TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
  v_org_id UUID;
BEGIN
  SELECT status, organization_id INTO v_old_status, v_org_id
  FROM requests WHERE id = p_request_id;

  -- Status geçmişini kaydet
  INSERT INTO request_status_history(request_id, from_status, to_status, changed_by, note)
  VALUES (p_request_id, v_old_status, p_new_status, auth.uid(), p_note);

  -- Talep durumunu güncelle
  UPDATE requests SET
    status = p_new_status,
    started_at = CASE WHEN p_new_status = 'design' AND started_at IS NULL THEN NOW() ELSE started_at END,
    submitted_for_approval_at = CASE WHEN p_new_status = 'approval' THEN NOW() ELSE submitted_for_approval_at END,
    approved_at = CASE WHEN p_new_status = 'completed' AND approved_by IS NOT NULL THEN NOW() ELSE approved_at END,
    completed_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE completed_at END,
    cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN NOW() ELSE cancelled_at END,
    revision_count = CASE WHEN p_new_status = 'revision' THEN revision_count + 1 ELSE revision_count END,
    updated_at = NOW()
  WHERE id = p_request_id;

  -- Bildirim oluştur (assigned_to varsa)
  INSERT INTO notifications(organization_id, user_id, type, title, body, data)
  SELECT
    v_org_id,
    CASE WHEN p_new_status = 'revision' THEN assigned_to ELSE created_by END,
    'status_changed',
    'Talep durumu güncellendi: ' || p_new_status,
    title || ' talebinin durumu ' || v_old_status || ' → ' || p_new_status || ' olarak değişti.',
    json_build_object('request_id', p_request_id, 'old_status', v_old_status, 'new_status', p_new_status)::jsonb
  FROM requests
  WHERE id = p_request_id
    AND (
      (p_new_status = 'revision' AND assigned_to IS NOT NULL) OR
      (p_new_status != 'revision' AND created_by != auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Full text search
-- ============================================================
CREATE OR REPLACE FUNCTION search_requests(p_org_id UUID, p_query TEXT)
RETURNS SETOF requests AS $$
  SELECT *
  FROM requests
  WHERE organization_id = p_org_id
    AND to_tsvector('turkish', COALESCE(title, '') || ' ' || COALESCE(description, ''))
        @@ plainto_tsquery('turkish', p_query)
  ORDER BY created_at DESC
  LIMIT 50
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- AI kredi kullanım kontrolü
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_consume_ai_credit(p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT ai_credits_limit, ai_credits_used INTO v_limit, v_used
  FROM organizations WHERE id = p_org_id;

  IF v_used >= v_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE organizations
  SET ai_credits_used = ai_credits_used + 1
  WHERE id = p_org_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
