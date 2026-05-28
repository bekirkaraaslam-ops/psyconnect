-- klinik_adresi (eski) → klinik_adres (yeni) birleştirme
-- Eski kolondaki veriyi yenisine taşı (yeni kolonda veri yoksa)
UPDATE psychologists
SET klinik_adres = klinik_adresi
WHERE klinik_adres IS NULL AND klinik_adresi IS NOT NULL;

-- Eski kolonu kaldır
ALTER TABLE psychologists DROP COLUMN IF EXISTS klinik_adresi;
