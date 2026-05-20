-- Hasta karşılama WhatsApp mesajı gönderildi mi takibi
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMPTZ DEFAULT NULL;
