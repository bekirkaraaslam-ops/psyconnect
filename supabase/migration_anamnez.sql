-- ============================================================
-- Anamnez Form Sistemi Migration
-- ============================================================

-- patients tablosuna anamnez alanları
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS anamnez_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS anamnez_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS anamnez_scheduled_at TIMESTAMPTZ;

-- Anamnez formları tablosu
CREATE TABLE IF NOT EXISTS anamnez_forms (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id           UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  token                     TEXT UNIQUE NOT NULL,
  expires_at                TIMESTAMPTZ NOT NULL,
  filled_at                 TIMESTAMPTZ,
  -- Form alanları (AES-256-GCM şifreli)
  sikayet_encrypted         TEXT,  -- Ana şikayet
  sure_encrypted            TEXT,  -- Ne zamandır devam ediyor
  gecmis_tedavi_encrypted   TEXT,  -- Önceki psikolojik destek
  ilac_kullanim_encrypted   TEXT,  -- İlaç kullanımı
  aile_gecmis_encrypted     TEXT,  -- Ailede psikiyatrik geçmiş
  uyku_durum_encrypted      TEXT,  -- Uyku durumu
  beslenme_durum_encrypted  TEXT,  -- Beslenme durumu
  acil_kisi_encrypted       TEXT,  -- Acil iletişim kişisi
  ek_notlar_encrypted       TEXT,  -- Ek notlar
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE anamnez_forms ENABLE ROW LEVEL SECURITY;

-- Psikologlar kendi formlarına erişebilir
DROP POLICY IF EXISTS "anamnez_psychologist_access" ON anamnez_forms;
CREATE POLICY "anamnez_psychologist_access" ON anamnez_forms
  FOR ALL
  TO authenticated
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE auth_user_id = auth.uid()
    )
  );
