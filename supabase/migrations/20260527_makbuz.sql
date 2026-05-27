-- Seans makbuzu gönderim zamanını tut
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS makbuz_gonderildi_at TIMESTAMPTZ;
