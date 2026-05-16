-- Migration v4: WhatsApp randevu onay/iptal sistemi

-- appointment_status ENUM tipine yeni değer ekle
-- (status bir CHECK constraint değil, PostgreSQL ENUM tipidir)
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'cancelled_by_patient';

-- appointments tablosuna hasta yanıt zamanı kolonu ekle
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS patient_responded_at TIMESTAMPTZ;
