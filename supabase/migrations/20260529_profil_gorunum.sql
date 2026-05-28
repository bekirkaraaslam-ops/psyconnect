ALTER TABLE psychologists
ADD COLUMN IF NOT EXISTS profil_gorunum JSONB NOT NULL DEFAULT '{
  "show_uzmanlik": true,
  "show_paketler": true,
  "show_yorumlar": true,
  "show_blog": true,
  "show_egitim": true,
  "show_klinik": true
}'::jsonb;
