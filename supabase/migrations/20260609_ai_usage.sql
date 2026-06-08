create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references psychologists(id) on delete cascade,
  month text not null, -- 'YYYY-MM' format
  soap_count int not null default 0,
  anamnez_count int not null default 0,
  unique(psychologist_id, month)
);

alter table ai_usage enable row level security;

create policy "Psikolog kendi AI kullanımını görebilir"
  on ai_usage for select
  using (psychologist_id in (
    select id from psychologists where auth_user_id = auth.uid()
  ));

create policy "Psikolog kendi AI kullanımını güncelleyebilir"
  on ai_usage for all
  using (psychologist_id in (
    select id from psychologists where auth_user_id = auth.uid()
  ));
