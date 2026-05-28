-- appointments tablosuna KVKK aydınlatma onay zamanı
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS kvkk_consented_at timestamptz;

-- anamnez_forms tablosuna açık rıza zamanı
ALTER TABLE anamnez_forms
  ADD COLUMN IF NOT EXISTS acik_riza_at timestamptz;

-- KVKK açık rıza kayıt tablosu
CREATE TABLE IF NOT EXISTS consents (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     uuid        REFERENCES patients(id) ON DELETE CASCADE,
  anamnez_form_id uuid       REFERENCES anamnez_forms(id) ON DELETE SET NULL,
  consent_type   text        NOT NULL,
  signed_at      timestamptz NOT NULL DEFAULT now(),
  ip_address     text
);

CREATE INDEX IF NOT EXISTS consents_patient_id_idx ON consents(patient_id);
