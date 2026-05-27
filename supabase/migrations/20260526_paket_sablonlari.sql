-- Psikologun tanımladığı seans paketi şablonları
CREATE TABLE IF NOT EXISTS paket_sablonlari (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id  UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  session_count    INTEGER NOT NULL CHECK (session_count > 0),
  price_tl         NUMERIC(10, 2) NOT NULL CHECK (price_tl >= 0),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE paket_sablonlari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psikolog kendi şablonlarını görebilir"
  ON paket_sablonlari FOR SELECT
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Psikolog kendi şablonlarını ekleyebilir"
  ON paket_sablonlari FOR INSERT
  WITH CHECK (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Psikolog kendi şablonlarını güncelleyebilir"
  ON paket_sablonlari FOR UPDATE
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Psikolog kendi şablonlarını silebilir"
  ON paket_sablonlari FOR DELETE
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE auth_user_id = auth.uid()
    )
  );

-- Service role (booking + WA bot public erişim için)
CREATE POLICY "Service role tam erişim"
  ON paket_sablonlari FOR ALL
  USING (auth.role() = 'service_role');
