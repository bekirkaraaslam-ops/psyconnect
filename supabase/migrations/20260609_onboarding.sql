-- Onboarding wizard için kolon ekleniyor
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Mevcut tüm kullanıcılar sistemi zaten kullanıyor — tamamlandı sayılır
UPDATE psychologists SET onboarding_completed = true;
