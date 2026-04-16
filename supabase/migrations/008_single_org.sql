-- Tek organizasyon modeli: organizations tablosuna default değerler ekle
-- Artık kullanıcıdan org adı/slug toplanmıyor, sistem otomatik oluşturuyor

ALTER TABLE organizations ALTER COLUMN name SET DEFAULT 'Workspace';
