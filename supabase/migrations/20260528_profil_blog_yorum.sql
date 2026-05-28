-- Psikolog profil alanları
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS bio_text         text,
  ADD COLUMN IF NOT EXISTS uzmanlik_alanlari text[],
  ADD COLUMN IF NOT EXISTS egitim           jsonb,
  ADD COLUMN IF NOT EXISTS foto_url         text,
  ADD COLUMN IF NOT EXISTS sehir            text,
  ADD COLUMN IF NOT EXISTS unvan            text,
  ADD COLUMN IF NOT EXISTS klinik_adi       text,
  ADD COLUMN IF NOT EXISTS klinik_adres     text,
  ADD COLUMN IF NOT EXISTS klinik_tel       text,
  ADD COLUMN IF NOT EXISTS calisma_saatleri text,
  ADD COLUMN IF NOT EXISTS profil_alinti    text,
  ADD COLUMN IF NOT EXISTS deneyim_yil      int,
  ADD COLUMN IF NOT EXISTS dil              text[];

-- Blog yazıları
CREATE TABLE IF NOT EXISTS psikolog_bloglar (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid        NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  baslik          text        NOT NULL,
  slug            text        NOT NULL,
  icerik          text        NOT NULL,
  kategori        text,
  yayinda         boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (psychologist_id, slug)
);
CREATE INDEX IF NOT EXISTS bloglar_psych_idx ON psikolog_bloglar(psychologist_id);

-- Danışan yorumları
CREATE TABLE IF NOT EXISTS psikolog_yorumlar (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid        NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  appointment_id  uuid        REFERENCES appointments(id) ON DELETE SET NULL,
  yildiz          int         NOT NULL CHECK (yildiz BETWEEN 1 AND 5),
  yorum_metni     text,
  reviewer_init   text,
  onaylandi       boolean     NOT NULL DEFAULT false,
  token           text        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  olusturuldu_at  timestamptz NOT NULL DEFAULT now(),
  dolduruldu_at   timestamptz
);
CREATE INDEX IF NOT EXISTS yorumlar_psych_idx ON psikolog_yorumlar(psychologist_id);
CREATE INDEX IF NOT EXISTS yorumlar_token_idx ON psikolog_yorumlar(token);

-- Appointments: yorum gönderildi mi takibi
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS yorum_gonderildi_at timestamptz;
