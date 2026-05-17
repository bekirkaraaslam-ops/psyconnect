-- =============================================
-- Seansify - Supabase Schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial');
CREATE TYPE appointment_status AS ENUM ('waiting', 'confirmed', 'canceled', 'completed');

-- =============================================
-- TABLE: psychologists
-- =============================================
CREATE TABLE psychologists (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  phone_number         TEXT,
  whatsapp_session     JSONB,
  is_connected         BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_status  subscription_status NOT NULL DEFAULT 'trial',
  subscription_ends_at TIMESTAMPTZ,
  klinik_adresi        TEXT,
  harita_linki         TEXT,
  online_gorusme_linki TEXT,
  hosgeldiniz_mesaji   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: patients
-- =============================================
CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id   UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  name_surname      TEXT NOT NULL,
  phone_number      TEXT NOT NULL,
  date_of_birth     DATE,
  notes_encrypted   TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (psychologist_id, phone_number)
);

-- =============================================
-- TABLE: appointments
-- =============================================
CREATE TABLE appointments (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id          UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  patient_id               UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date         TIMESTAMPTZ NOT NULL,
  duration_minutes         INTEGER NOT NULL DEFAULT 50,
  status                   appointment_status NOT NULL DEFAULT 'waiting',
  reminder_sent            BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent_at         TIMESTAMPTZ,
  session_notes_encrypted  TEXT,
  appointment_type         TEXT NOT NULL DEFAULT 'yuzyuze' CHECK (appointment_type IN ('online', 'yuzyuze')),
  toplam_paket_seansi      INTEGER,
  mevcut_seans_no          INTEGER,
  is_first_session         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: hasta_notlari
-- =============================================
CREATE TABLE hasta_notlari (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id       UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  hasta_id              UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  seans_tarihi          TIMESTAMPTZ NOT NULL,
  seans_notu_encrypted  TEXT,
  gelecek_plan_encrypted TEXT,
  ev_odevi_encrypted    TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: reminder_logs
-- =============================================
CREATE TABLE reminder_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL,
  error_message   TEXT
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_patients_psychologist ON patients(psychologist_id);
CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_reminder ON appointments(reminder_sent, appointment_date)
  WHERE reminder_sent = FALSE AND status = 'waiting';
CREATE INDEX idx_hasta_notlari_hasta ON hasta_notlari(hasta_id);
CREATE INDEX idx_hasta_notlari_psikolog ON hasta_notlari(psychologist_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_psychologists_updated_at
  BEFORE UPDATE ON psychologists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_hasta_notlari_updated_at
  BEFORE UPDATE ON hasta_notlari FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasta_notlari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psychologist_self" ON psychologists
  FOR ALL USING (auth.uid() = auth_user_id);

CREATE POLICY "patient_owner" ON patients
  FOR ALL USING (
    psychologist_id = (SELECT id FROM psychologists WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "appointment_owner" ON appointments
  FOR ALL USING (
    psychologist_id = (SELECT id FROM psychologists WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "nota_owner" ON hasta_notlari
  FOR ALL USING (
    psychologist_id = (SELECT id FROM psychologists WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "reminder_log_owner" ON reminder_logs
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments
      WHERE psychologist_id = (SELECT id FROM psychologists WHERE auth_user_id = auth.uid())
    )
  );

-- =============================================
-- AUTO-CREATE PSYCHOLOGIST PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO psychologists (auth_user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
