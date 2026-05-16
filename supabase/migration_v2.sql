-- Migration v2: Online link, paket takibi, hoş geldiniz mesajı

-- psychologists tablosuna yeni alanlar
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS klinik_adresi TEXT,
  ADD COLUMN IF NOT EXISTS harita_linki TEXT,
  ADD COLUMN IF NOT EXISTS online_gorusme_linki TEXT,
  ADD COLUMN IF NOT EXISTS hosgeldiniz_mesaji TEXT;

-- appointments tablosuna yeni alanlar
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS appointment_type TEXT NOT NULL DEFAULT 'yuzyuze'
    CHECK (appointment_type IN ('online', 'yuzyuze')),
  ADD COLUMN IF NOT EXISTS toplam_paket_seansi INTEGER,
  ADD COLUMN IF NOT EXISTS mevcut_seans_no INTEGER,
  ADD COLUMN IF NOT EXISTS is_first_session BOOLEAN NOT NULL DEFAULT FALSE;
