-- ============================================================
-- 005_enhancements.sql
-- Designer notification trigger, dashboard period stats, user title field
-- ============================================================

-- ============================================================
-- User title field
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT;

-- ============================================================
-- Notify designer when a new request is created
-- ============================================================
CREATE OR REPLACE FUNCTION notify_designer_on_new_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    -- Notify the specifically assigned designer
    INSERT INTO notifications(organization_id, user_id, type, title, body, data)
    VALUES (
      NEW.organization_id,
      NEW.assigned_to,
      'request_assigned',
      'Yeni talep atandı',
      NEW.title || ' talebi size atandı.',
      json_build_object('request_id', NEW.id)::jsonb
    );
  ELSE
    -- Notify all active designers in the org
    INSERT INTO notifications(organization_id, user_id, type, title, body, data)
    SELECT
      NEW.organization_id,
      u.id,
      'request_assigned',
      'Yeni talep oluşturuldu',
      NEW.title || ' talebi sisteme eklendi.',
      json_build_object('request_id', NEW.id)::jsonb
    FROM users u
    WHERE u.organization_id = NEW.organization_id
      AND u.role = 'designer'
      AND u.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET row_security = off;

DROP TRIGGER IF EXISTS trigger_notify_designer_on_new_request ON requests;
CREATE TRIGGER trigger_notify_designer_on_new_request
  AFTER INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_designer_on_new_request();

-- ============================================================
-- notifications tablosunu Realtime publication'a ekle
-- (NotificationBell'in INSERT event'lerini alabilmesi için şart)
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN
  -- zaten eklenmiş, devam et
END;
$$;

-- ============================================================
-- Dashboard stats with optional period filter
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats_by_period(
  p_org_id UUID,
  p_days INTEGER DEFAULT 0
)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_requests',     COUNT(*),
    'new_requests',       COUNT(*) FILTER (WHERE status = 'new'),
    'active_designs',     COUNT(*) FILTER (WHERE status IN ('brief_review', 'design')),
    'in_revision',        COUNT(*) FILTER (WHERE status = 'revision'),
    'pending_approvals',  COUNT(*) FILTER (WHERE status = 'approval'),
    'completed',          COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled',          COUNT(*) FILTER (WHERE status = 'cancelled'),
    'total_revisions',    COALESCE(SUM(revision_count), 0),
    'avg_delivery_days',  get_avg_delivery_time(p_org_id),
    'avg_revisions',      ROUND(AVG(revision_count), 1)
  )
  FROM requests
  WHERE organization_id = p_org_id
    AND (p_days = 0 OR created_at >= NOW() - (p_days || ' days')::INTERVAL)
$$ LANGUAGE sql STABLE SECURITY DEFINER;
