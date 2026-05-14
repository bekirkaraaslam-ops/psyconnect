/**
 * Netlify Scheduled Function – send-reminders
 *
 * Zamanlaması: Her saatin başında çalışır ("0 * * * *")
 * Görev      : Bir sonraki saat içinde randevusu olan ve
 *              henüz hatırlatıcı gönderilmemiş hastaları bulur,
 *              WhatsApp mesajı gönderir, DB'yi günceller.
 *
 * Netlify Dashboard → Functions → Scheduled Functions kısmından
 * çalışma geçmişini izleyebilirsiniz.
 */

import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

// ── Supabase admin client (RLS bypass) ──────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Randevu penceresi: şu andan 23-25 saat sonrası ──────────
function getReminderWindow() {
  const now = Date.now()
  const from = new Date(now + 23 * 60 * 60 * 1000).toISOString()
  const to   = new Date(now + 25 * 60 * 60 * 1000).toISOString()
  return { from, to }
}

// ── Spam filtresi: 10-25 sn rastgele gecikme ────────────────
function randomDelay() {
  const ms = Math.floor(Math.random() * 15_000) + 10_000
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Baileys ile bağlan ve mesaj gönder ──────────────────────
async function sendViaWhatsApp(
  sessionJson: Record<string, unknown>,
  toPhone: string,
  message: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Baileys in-memory auth state'e session'ı yükle
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/wa-session')

    // Supabase'den gelen session verisini state'e inject et
    if (sessionJson?.creds) {
      Object.assign(state.creds, sessionJson.creds)
    }

    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console as any),
      },
      printQRInTerminal: false,
      logger: { level: 'silent' } as any,
    })

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        const jid = `${toPhone}@s.whatsapp.net`
        await sock.sendMessage(jid, { text: message })
        await sock.logout()
        resolve()
      }

      if (connection === 'close') {
        const code = (lastDisconnect?.error as Boom)?.output?.statusCode
        if (code !== DisconnectReason.loggedOut) {
          reject(new Error(`WhatsApp bağlantısı kapandı: ${code}`))
        } else {
          reject(new Error('WhatsApp oturumu geçersiz – QR yeniden taranmalı'))
        }
      }
    })

    // 30 sn timeout
    setTimeout(() => reject(new Error('WhatsApp bağlantı zaman aşımı')), 30_000)
  })
}

// ── Ana handler ──────────────────────────────────────────────
const handler = schedule('0 * * * *', async () => {
  const supabase = getSupabase()
  const { from, to } = getReminderWindow()

  console.log(`[send-reminders] Pencere: ${from} → ${to}`)

  // Hatırlatıcı gönderilmemiş, iptal olmamış randevuları getir
  const { data: appointments, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      duration_minutes,
      patient:patients(name_surname, phone_number),
      psychologist:psychologists(id, full_name, whatsapp_session, is_connected)
    `)
    .eq('reminder_sent', false)
    .neq('status', 'canceled')
    .neq('status', 'completed')
    .gte('appointment_date', from)
    .lte('appointment_date', to)

  if (fetchError) {
    console.error('[send-reminders] DB sorgu hatası:', fetchError.message)
    return { statusCode: 500 }
  }

  if (!appointments || appointments.length === 0) {
    console.log('[send-reminders] Gönderilecek hatırlatıcı yok.')
    return { statusCode: 200 }
  }

  console.log(`[send-reminders] ${appointments.length} hatırlatıcı gönderilecek`)

  for (const apt of appointments as any[]) {
    const psychologist = apt.psychologist
    const patient      = apt.patient

    if (!psychologist?.is_connected || !psychologist?.whatsapp_session) {
      console.warn(`[send-reminders] Psikolog WA bağlı değil – apt: ${apt.id}`)
      continue
    }

    // Mesaj metni
    const date     = new Date(apt.appointment_date)
    const timeStr  = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    const dateStr  = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
    const message  =
      `Sayın ${patient.name_surname},\n\n` +
      `${dateStr} tarihinde saat *${timeStr}*'de ` +
      `*${psychologist.full_name}* ile randevunuz bulunmaktadır.\n\n` +
      `Randevunuzu iptal etmek veya değiştirmek isterseniz lütfen bizimle iletişime geçin.`

    try {
      await sendViaWhatsApp(
        psychologist.whatsapp_session,
        patient.phone_number,
        message
      )

      // Başarılı → DB güncelle
      await supabase
        .from('appointments')
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq('id', apt.id)

      await supabase.from('reminder_logs').insert({
        appointment_id: apt.id,
        status: 'success',
      })

      console.log(`[send-reminders] ✓ Gönderildi → ${patient.name_surname} (${patient.phone_number})`)
    } catch (err: any) {
      console.error(`[send-reminders] ✗ Hata → ${apt.id}: ${err.message}`)

      await supabase.from('reminder_logs').insert({
        appointment_id: apt.id,
        status: 'failed',
        error_message: err.message,
      })
    }

    // Spam filtresi – sonraki mesaj öncesi bekle
    await randomDelay()
  }

  return { statusCode: 200 }
})

export { handler }
