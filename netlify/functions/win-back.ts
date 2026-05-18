import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendViaRailway(psychologistId: string, phone: string, message: string) {
  await fetch(`${process.env.WA_SERVICE_URL}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.WA_API_KEY!,
    },
    body: JSON.stringify({ psychologistId, phone, message }),
  })
}

export const handler = schedule('0 10 * * *', async () => {
  const supabase = getSupabase()

  // Tüm aktif psikologları getir
  const { data: psychologists } = await supabase
    .from('psychologists')
    .select('id, full_name, is_connected')
    .eq('is_connected', true)

  if (!psychologists?.length) return { statusCode: 200 }

  const now = new Date()
  const cutoff = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()

  for (const psych of psychologists) {
    // Son seansı 45+ gün önce olan ve ileriye randevusu olmayan aktif hastalar
    const { data: patients } = await supabase
      .from('patients')
      .select('id, name_surname, phone_number, win_back_sent_at')
      .eq('psychologist_id', psych.id)
      .eq('is_active', true)

    if (!patients?.length) continue

    for (const patient of patients) {
      // Zaten geri kazanım mesajı gönderilmişse atla
      if (patient.win_back_sent_at) {
        const sentAt = new Date(patient.win_back_sent_at)
        const daysSince = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 90) continue // 90 günde bir tekrar gönderilebilir
      }

      // Son tamamlanan/onaylanan randevuyu bul
      const { data: lastApt } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('psychologist_id', psych.id)
        .eq('patient_id', patient.id)
        .in('status', ['completed', 'confirmed'])
        .order('appointment_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!lastApt) continue
      if (lastApt.appointment_date > cutoff) continue // 45 gün geçmemiş

      // İleri tarihli randevu var mı kontrol et
      const { data: futureApt } = await supabase
        .from('appointments')
        .select('id')
        .eq('psychologist_id', psych.id)
        .eq('patient_id', patient.id)
        .gt('appointment_date', now.toISOString())
        .not('status', 'in', '("canceled","cancelled_by_patient")')
        .limit(1)
        .maybeSingle()

      if (futureApt) continue // Zaten ileriye randevusu var

      // Mesaj gönder
      const firstName = patient.name_surname.split(' ')[0]
      const message = `Merhaba ${firstName}, ben ${psych.full_name}. Bir süredir görüşemediğimizi fark ettim ve nasıl olduğunuzu merak ettim. Yeni bir seans planlamak ister misiniz? 🌿`

      try {
        await sendViaRailway(psych.id, patient.phone_number, message)

        await supabase
          .from('patients')
          .update({ win_back_sent_at: now.toISOString() })
          .eq('id', patient.id)

        // Aşırı mesaj göndermemek için kısa bekleme
        await new Promise(r => setTimeout(r, 3000))
      } catch {
        // Sessiz hata — bir sonraki hasta ile devam et
      }
    }
  }

  return { statusCode: 200 }
})
