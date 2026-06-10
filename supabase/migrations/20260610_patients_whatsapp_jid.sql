-- patients tablosuna whatsapp_jid kolonu ekle
-- WhatsApp @lid JID formatındaki kullanıcılara doğru adrese mesaj göndermek için
ALTER TABLE patients ADD COLUMN IF NOT EXISTS whatsapp_jid text;
