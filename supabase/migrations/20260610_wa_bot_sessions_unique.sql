-- wa_bot_sessions tablosunda (phone_number, psychologist_id) unique constraint yoksa ekle
-- Bu olmadan upsert güncelleme yerine yeni satır ekler, session okuma bozulur

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'wa_bot_sessions_phone_psychologist_unique'
  ) then
    alter table wa_bot_sessions
      add constraint wa_bot_sessions_phone_psychologist_unique
      unique (phone_number, psychologist_id);
  end if;
end $$;

-- Varsa fazla (duplicate) satırları temizle, en güncelini tut
delete from wa_bot_sessions a
using wa_bot_sessions b
where a.phone_number = b.phone_number
  and a.psychologist_id = b.psychologist_id
  and a.updated_at < b.updated_at;
