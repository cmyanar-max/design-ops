-- ============================================================
-- 013_delete_account_rpc.sql
-- Hesap silme işlemini atomik yapan RPC fonksiyonu
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kimlik doğrulaması gerekli';
  END IF;

  -- Nullable audit alanlarını NULL'a çek (kayıtlar kalsın)
  UPDATE audit_logs SET user_id = NULL WHERE user_id = v_user_id;
  UPDATE brands SET created_by = NULL WHERE created_by = v_user_id;

  -- Atanmış request FK'larını gevşet
  UPDATE requests SET assigned_to = NULL WHERE assigned_to = v_user_id;
  UPDATE requests SET approved_by = NULL WHERE approved_by = v_user_id;

  -- Yaprak kayıtları sil
  DELETE FROM notifications WHERE user_id = v_user_id;
  DELETE FROM ai_requests WHERE user_id = v_user_id;
  DELETE FROM time_logs WHERE user_id = v_user_id;
  DELETE FROM comments WHERE user_id = v_user_id;
  DELETE FROM files WHERE uploaded_by = v_user_id;
  DELETE FROM request_status_history WHERE changed_by = v_user_id;
  DELETE FROM invitations WHERE invited_by = v_user_id;

  -- Kullanıcının oluşturduğu talepler (cascade ile alt kayıtları temizler)
  DELETE FROM requests WHERE created_by = v_user_id;

  -- users kaydını sil (auth kaydı API route'ta adminClient ile silinir)
  DELETE FROM users WHERE id = v_user_id;
END;
$$;

-- Sadece kimliği doğrulanmış kullanıcılar kendi hesaplarını silebilir
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
