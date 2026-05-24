import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Her gün 08:00 UTC (11:00 Istanbul) çalışır
export const handler = schedule('0 8 * * *', async () => {
  const supabase = getSupabase()
  const now = new Date()

  // Yarın penceresi (24-48 saat arası)
  const tomorrowFrom = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  const tomorrowTo   = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()

  // Anamnez aktif, henüz gönderilmemiş ve zamanlanmamış hastalar
  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, psychologist_id, name_surname, phone_number')
    .eq('anamnez_enabled', true)
    .eq('is_active', true)
    .is('anamnez_sent_at', null)
    .is('anamnez_scheduled_at', null)

  if (error) {
    console.error('[anamnez-scheduler] DB hatası:', error.message)
    return { statusCode: 500 }
  }

  if (!patients?.length) {
    console.log('[anamnez-scheduler] Zamanlanacak hasta yok.')
    return { statusCode: 200 }
  }

  console.log(`[anamnez-scheduler] ${patients.length} hasta kontrol ediliyor`)

  for (const patient of patients) {
    // Yarın randevusu var mı?
    const { data: apt } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', patient.id)
      .gte('appointment_date', tomorrowFrom)
      .lte('appointment_date', tomorrowTo)
      .not('status', 'in', '("canceled","cancelled_by_patient")')
      .limit(1)
      .maybeSingle()

    if (!apt) continue

    // 09:00–18:00 Istanbul (06:00–15:00 UTC) arası rastgele zaman üret
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setUTCHours(6, 0, 0, 0) // 09:00 Istanbul = 06:00 UTC
    const randomMinutes = Math.floor(Math.random() * 540) // 0–539 dakika (9 saat)
    const scheduledAt = new Date(tomorrow.getTime() + randomMinutes * 60 * 1000)

    // Token ve form kaydı oluştur
    const token     = crypto.randomBytes(8).toString('hex')
    const expiresAt = new Date(scheduledAt.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 gün geçerli

    const { error: insertError } = await supabase.from('anamnez_forms').insert({
      patient_id:      patient.id,
      psychologist_id: patient.psychologist_id,
      token,
      expires_at:      expiresAt.toISOString(),
    })

    if (insertError) {
      console.error(`[anamnez-scheduler] Form insert hatası – ${patient.id}:`, insertError.message)
      continue
    }

    await supabase
      .from('patients')
      .update({ anamnez_scheduled_at: scheduledAt.toISOString() })
      .eq('id', patient.id)

    console.log(`[anamnez-scheduler] ✓ Zamanlandı → ${patient.name_surname} – ${scheduledAt.toISOString()}`)
  }

  return { statusCode: 200 }
})
