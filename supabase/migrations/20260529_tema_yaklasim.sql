-- Website tema sistemi için yeni alanlar
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS tema        text    DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS yaklasim    jsonb,
  ADD COLUMN IF NOT EXISTS tpd_uye_no  text;
