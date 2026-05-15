import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getReminderWindow() {
  const now = Date.now()
  const from = new Date(now + 23 * 60 * 60 * 1000).toISOString()
  const to   = new Date(now + 25 * 60 * 60 * 1000).toISOString()
  return { from, to }
}

function randomDelay() {
  const ms = Math.floor(Math.random() * 15_000) + 10_000
  return new Promise(resolve => setTimeout(resolve, ms))
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

const handler = schedule('0 * * * *', async () => {
  const supabase = getSupabase()
  const { from, to } = getReminderWindow()

  console.log(`[send-reminders] Pencere: ${from} → ${to}`)

  const { data: appointments, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      patient:patients(name_surname, phone_number),
      psychologist:psychologists(id, full_name, is_connected)
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

    if (!psychologist?.is_connected) {
      console.warn(`[send-reminders] Psikolog WA bağlı değil – apt: ${apt.id}`)
      continue
    }

    const date    = new Date(apt.appointment_date)
    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
    const message =
      `Sayın ${patient.name_surname},\n\n` +
      `${dateStr} tarihinde saat *${timeStr}*'de ` +
      `*${psychologist.full_name}* ile randevunuz bulunmaktadır.\n\n` +
      `Randevunuzu iptal etmek veya değiştirmek isterseniz lütfen bizimle iletişime geçin.`

    try {
      await sendViaRailway(psychologist.id, patient.phone_number, message)

      await supabase
        .from('appointments')
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq('id', apt.id)

      await supabase.from('reminder_logs').insert({
        appointment_id: apt.id,
        status: 'success',
      })

      console.log(`[send-reminders] ✓ Gönderildi → ${patient.name_surname}`)
    } catch (err: any) {
      console.error(`[send-reminders] ✗ Hata → ${apt.id}: ${err.message}`)

      await supabase.from('reminder_logs').insert({
        appointment_id: apt.id,
        status: 'failed',
        error_message: err.message,
      })
    }

    await randomDelay()
  }

  return { statusCode: 200 }
})

export { handler }
