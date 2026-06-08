alter table ai_usage
  add column if not exists seans_analiz_count int not null default 0,
  add column if not exists olcek_yorum_count  int not null default 0;
