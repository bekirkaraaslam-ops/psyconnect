-- İlk seans açıklaması alanı
alter table psychologists
  add column if not exists ilk_seans_metni text;
