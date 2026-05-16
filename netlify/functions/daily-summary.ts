import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendViaRailway(psychologistId: string, phone: string, message: string) {
  const res = await fetch(`${process.env.WA_SERVICE_URL}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.WA_API_KEY!,
    },
    body: JSON.stringify({ psychologistId, phone, message }),
  })
  if (!res.ok) throw new Error(`Railway servis hatası: ${res.status}`)
}

const handler = schedule('30 5 * * *', async () => {
  // 08:30 Türkiye saati = 05:30 UTC
  const supabase = getSupabase()

  const trtNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const trtToday = new Date(trtNow)
  trtToday.setHours(0, 0, 0, 0)
  const trtTomorrow = new Date(trtToday)
  trtTomorrow.setDate(trtTomorrow.getDate() + 1)

  const fromUtc = new Date(trtToday.getTime() - 3 * 60 * 60 * 1000).toISOString()
  const toUtc   = new Date(trtTomorrow.getTime() - 3 * 60 * 60 * 1000).toISOString()

  console.log(`[daily-summary] Tarih aralığı (UTC): ${fromUtc} → ${toUtc}`)

  const { data: psychologists, error: psyError } = await supabase
    .from('psychologists')
    .select('id, full_name, phone_number, is_connected')
    .eq('is_connected', true)

  if (psyError || !psychologists?.length) {
    console.log('[daily-summary] Bağlı psikolog yok.')
    return { statusCode: 200 }
  }

  for (const psychologist of psychologists) {
    if (!psychologist.phone_number) continue

    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_type, mevcut_seans_no, toplam_paket_seansi, patient:patients(name_surname)')
      .eq('psychologist_id', psychologist.id)
      .neq('status', 'canceled')
      .neq('status', 'completed')
      .gte('appointment_date', fromUtc)
      .lt('appointment_date', toUtc)
      .order('appointment_date')

    if (!appointments?.length) {
      console.log(`[daily-summary] ${psychologist.full_name} için bugün randevu yok.`)
      continue
    }

    const dateStr = new Date(trtToday).toLocaleDateString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    const randevuListesi = appointments.map((apt: any) => {
      const saatStr = new Date(apt.appointment_date).toLocaleTimeString('tr-TR', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'
      })
      const tip = apt.appointment_type === 'online' ? '💻' : '🏢'
      const paket = apt.mevcut_seans_no && apt.toplam_paket_seansi
        ? ` (${apt.mevcut_seans_no}/${apt.toplam_paket_seansi})`
        : ''
      return `${tip} ${saatStr} – ${apt.patient?.name_surname}${paket}`
    }).join('\n')

    const message =
      `📋 *Günlük Randevu Özeti – ${dateStr}*\n\n` +
      `${randevuListesi}\n\n` +
      `Toplam: *${appointments.length} randevu*`

    try {
      await sendViaRailway(psychologist.id, normalizePhone(psychologist.phone_number), message)
      console.log(`[daily-summary] ✓ Özet gönderildi → ${psychologist.full_name}`)
    } catch (err: any) {
      console.error(`[daily-summary] ✗ Hata → ${psychologist.full_name}: ${err.message}`)
    }
  }

  return { statusCode: 200 }
})

export { handler }
