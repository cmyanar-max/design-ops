-- ============================================================
-- 012_fix_self_notifications.sql
-- Tasarımcı kendi kanbanında işlem yaparken kendine bildirim
-- gitmesini engelle. revision durumunda da auth.uid() kontrolü eklendi.
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

  -- Status gecmisini kaydet
  INSERT INTO request_status_history(request_id, from_status, to_status, changed_by, note)
  VALUES (p_request_id, v_old_status, p_new_status, auth.uid(), p_note);

  -- Talep durumunu guncelle
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

  -- Genel status_changed bildirimi
  -- Kendi aksiyonları için bildirim gönderme (hem revision hem diğer durumlar)
  INSERT INTO notifications(organization_id, user_id, type, title, body, data)
  SELECT
    v_org_id,
    CASE WHEN p_new_status = 'revision' THEN assigned_to ELSE created_by END,
    'status_changed',
    'Talep durumu guncellendi: ' || p_new_status,
    title || ' talebinin durumu ' || v_old_status || ' → ' || p_new_status || ' olarak degisti.',
    json_build_object('request_id', p_request_id, 'old_status', v_old_status, 'new_status', p_new_status)::jsonb
  FROM requests
  WHERE id = p_request_id
    AND (
      (p_new_status = 'revision' AND assigned_to IS NOT NULL AND assigned_to != auth.uid()) OR
      (p_new_status != 'revision' AND created_by != auth.uid())
    );

  -- revision_requested bildirimi: tasarimciya revizyon istegi bildir
  IF p_new_status = 'revision' THEN
    INSERT INTO notifications(organization_id, user_id, type, title, body, data)
    SELECT
      v_org_id,
      assigned_to,
      'revision_requested',
      'Revizyon istendi',
      title || ' talebi icin revizyon istendi.',
      json_build_object('request_id', p_request_id, 'note', COALESCE(p_note, ''))::jsonb
    FROM requests
    WHERE id = p_request_id
      AND assigned_to IS NOT NULL
      AND assigned_to != auth.uid();
  END IF;

  -- approved bildirimi: talep sahibine onay bildir
  IF p_new_status = 'completed' AND v_old_status = 'approval' THEN
    INSERT INTO notifications(organization_id, user_id, type, title, body, data)
    SELECT
      v_org_id,
      created_by,
      'approved',
      'Talep onaylandi',
      title || ' talebi onaylandi ve tamamlandi.',
      json_build_object('request_id', p_request_id)::jsonb
    FROM requests
    WHERE id = p_request_id
      AND created_by != auth.uid();
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET row_security = off;
