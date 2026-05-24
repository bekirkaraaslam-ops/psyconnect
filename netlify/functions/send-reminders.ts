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
  // 18-26 saat arası: dar pencerede Railway düşükse retry fırsatı tanır
  const from = new Date(now + 18 * 60 * 60 * 1000).toISOString()
  const to   = new Date(now + 26 * 60 * 60 * 1000).toISOString()
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
      appointment_type,
      toplam_paket_seansi,
      mevcut_seans_no,
      is_first_session,
      patient:patients(name_surname, phone_number),
      psychologist:psychologists(id, full_name, is_connected, harita_linki, online_gorusme_linki, hosgeldiniz_mesaji)
    `)
    .eq('reminder_sent', false)
    .neq('status', 'canceled')
    .neq('status', 'cancelled_by_patient')
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
    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Istanbul' })
    const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })

    const paketBilgisi = apt.mevcut_seans_no && apt.toplam_paket_seansi
      ? ` (${apt.mevcut_seans_no}. seans / ${apt.toplam_paket_seansi} seanslık paket)`
      : ''

    let lokasyonBilgisi = ''
    if (apt.appointment_type === 'online' && psychologist.online_gorusme_linki) {
      lokasyonBilgisi = `\n\n🔗 *Online Görüşme Linki:* ${psychologist.online_gorusme_linki}`
    } else if (apt.appointment_type === 'yuzyuze' && psychologist.harita_linki) {
      lokasyonBilgisi = `\n\n📍 *Konum:* ${psychologist.harita_linki}`
    }

    const message =
      `Sayın ${patient.name_surname},\n\n` +
      `${dateStr} tarihinde saat *${timeStr}*'de ` +
      `*${psychologist.full_name}* ile randevunuz bulunmaktadır${paketBilgisi}.` +
      lokasyonBilgisi +
      `\n\n✅ Onaylamak için *EVET* yazın\n❌ İptal etmek için *İPTAL* yazın`

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

      if (apt.is_first_session && psychologist.hosgeldiniz_mesaji) {
        await randomDelay()
        await sendViaRailway(psychologist.id, patient.phone_number, psychologist.hosgeldiniz_mesaji)
        await supabase
          .from('appointments')
          .update({ is_first_session: false })
          .eq('id', apt.id)
        console.log(`[send-reminders] ✓ Hoş geldiniz mesajı gönderildi → ${patient.name_surname}`)
      }
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

  // ── Anamnez form gönderimleri ────────────────────────────────
  const { data: anamnezPatients } = await supabase
    .from('patients')
    .select('id, name_surname, phone_number, psychologist_id')
    .eq('anamnez_enabled', true)
    .eq('is_active', true)
    .is('anamnez_sent_at', null)
    .not('anamnez_scheduled_at', 'is', null)
    .lte('anamnez_scheduled_at', new Date().toISOString())

  for (const patient of anamnezPatients ?? []) {
    const { data: form } = await supabase
      .from('anamnez_forms')
      .select('token')
      .eq('patient_id', patient.id)
      .is('filled_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!form) continue

    const { data: psych } = await supabase
      .from('psychologists')
      .select('is_connected')
      .eq('id', patient.psychologist_id)
      .single()

    if (!psych?.is_connected) continue

    const firstName = patient.name_surname.split(' ')[0]
    const baseUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://seansify.app'
    const formUrl   = `${baseUrl}/anamnez/${form.token}`

    const message =
      `Merhaba ${firstName}, yarınki seans öncesinde psikoloğunuzun sizi daha iyi tanıyabilmesi için ` +
      `aşağıdaki kısa formu doldurmanızı rica ediyoruz 📋\n\n${formUrl}\n\nLink 7 gün geçerlidir.`

    try {
      await sendViaRailway(patient.psychologist_id, patient.phone_number, message)

      await supabase
        .from('patients')
        .update({ anamnez_sent_at: new Date().toISOString() })
        .eq('id', patient.id)

      console.log(`[send-reminders] ✓ Anamnez linki gönderildi → ${patient.name_surname}`)
    } catch (err: any) {
      console.error(`[send-reminders] ✗ Anamnez hatası → ${patient.id}: ${err.message}`)
    }

    await randomDelay()
  }

  return { statusCode: 200 }
})

export { handler }
