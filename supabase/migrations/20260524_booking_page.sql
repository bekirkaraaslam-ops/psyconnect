-- Booking page için gerekli alanlar

-- Psikologlar tablosuna seans ve booking alanları
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS session_duration_minutes INT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS buffer_minutes INT NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS booking_slug TEXT UNIQUE;

-- Mevcut psikologlar için slug üret (id'nin ilk 8 karakteri)
UPDATE psychologists
SET booking_slug = LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 6)
WHERE booking_slug IS NULL;

-- Randevular tablosuna kaynak ve booking bilgileri
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS booking_name TEXT,
  ADD COLUMN IF NOT EXISTS booking_phone TEXT;
-- source: 'manual' | 'booking_page'
-- booking_name/phone: booking_page'den gelen danışan bilgisi (hasta henüz patients tablosunda yokken)
