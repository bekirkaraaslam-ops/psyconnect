-- ─── Ödeme Takip: appointments tablosuna ───────────────────────────────────
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS ucret NUMERIC,
  ADD COLUMN IF NOT EXISTS odeme_durumu TEXT NOT NULL DEFAULT 'bekliyor',
  ADD COLUMN IF NOT EXISTS odeme_tarihi TIMESTAMPTZ;

-- ─── Psikolog: varsayılan seans ücreti + tatil modu ─────────────────────────
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS varsayilan_seans_ucreti NUMERIC,
  ADD COLUMN IF NOT EXISTS tatil_modu BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── Ödemeler geçmiş tablosu ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS odemeler (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  tutar          NUMERIC NOT NULL,
  aciklama       TEXT,
  odeme_tarihi   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS odemeler_patient       ON odemeler(patient_id);
CREATE INDEX IF NOT EXISTS odemeler_psychologist  ON odemeler(psychologist_id);
CREATE INDEX IF NOT EXISTS odemeler_appointment   ON odemeler(appointment_id);

-- ─── Onam Formları tablosu ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onam_formlar (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  token           TEXT UNIQUE NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  filled_at       TIMESTAMPTZ,
  imza_text       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS onam_formlar_patient ON onam_formlar(patient_id);
CREATE INDEX IF NOT EXISTS onam_formlar_token   ON onam_formlar(token);
