-- ============================================================
-- 005_realtime.sql
-- Supabase Realtime publication ayarları
-- ============================================================

-- requests tablosunu Realtime publication'a ekle
-- (notifications zaten ekliyse bu satır hata vermez)
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Filtered realtime subscriptions (user_id, organization_id gibi PK dışı sütunlar)
-- için REPLICA IDENTITY FULL şart — aksi halde filter çalışmaz
ALTER TABLE requests REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE comments REPLICA IDENTITY FULL;

-- Not: Supabase Dashboard → Database → Replication
-- bölümünden de bu tabloları görebilir/yönetebilirsin.
