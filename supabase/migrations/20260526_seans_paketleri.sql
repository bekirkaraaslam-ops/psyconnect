CREATE TABLE IF NOT EXISTS seans_paketleri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  toplam_seans INTEGER NOT NULL,
  kullanilan_seans INTEGER NOT NULL DEFAULT 0,
  birim_fiyat NUMERIC NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seans_paketleri_patient ON seans_paketleri(patient_id);
CREATE INDEX IF NOT EXISTS seans_paketleri_psychologist ON seans_paketleri(psychologist_id);
CREATE INDEX IF NOT EXISTS seans_paketleri_aktif ON seans_paketleri(patient_id, aktif);
