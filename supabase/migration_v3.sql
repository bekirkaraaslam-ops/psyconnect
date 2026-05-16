-- Migration v3: Seans Notları (hasta_notlari)

CREATE TABLE IF NOT EXISTS hasta_notlari (
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

CREATE INDEX IF NOT EXISTS idx_hasta_notlari_hasta ON hasta_notlari(hasta_id);
CREATE INDEX IF NOT EXISTS idx_hasta_notlari_psikolog ON hasta_notlari(psychologist_id);

CREATE TRIGGER trg_hasta_notlari_updated_at
  BEFORE UPDATE ON hasta_notlari FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE hasta_notlari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nota_owner" ON hasta_notlari
  FOR ALL USING (
    psychologist_id = (SELECT id FROM psychologists WHERE auth_user_id = auth.uid())
  );
