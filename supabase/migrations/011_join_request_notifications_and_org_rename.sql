-- ============================================================
-- 011_join_request_notifications_and_org_rename.sql
-- 1. notifications.type CHECK constraint'ine 'join_request' eklendi
-- 2. organizations tablosuna name_change_count kolonu eklendi
--    (max 2 yeniden adlandırma için sayaç)
-- ============================================================

-- 1) notifications.type için 'join_request' destekle
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'request_assigned', 'status_changed', 'comment_added',
    'revision_requested', 'approved', 'mention', 'deadline_reminder',
    'join_request'
  ));

-- 2) organizations: ad değişikliği sayacı
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS name_change_count INTEGER NOT NULL DEFAULT 0;
