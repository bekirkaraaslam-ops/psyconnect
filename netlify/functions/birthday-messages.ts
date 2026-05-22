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

export const handler = schedule('5 10 * * *', async () => {
  const supabase = getSupabase()

  const now = new Date()
  const todayMonth = now.getMonth() + 1
  const todayDay = now.getDate()
  const thisYear = now.getFullYear()

  // WhatsApp bağlı psikologları getir
  const { data: psychologists } = await supabase
    .from('psychologists')
    .select('id, full_name, is_connected')
    .eq('is_connected', true)

  if (!psychologists?.length) return { statusCode: 200 }

  for (const psych of psychologists) {
    // Bugün doğum günü olan ve bu yıl henüz mesaj gönderilmemiş aktif hastalar
    const { data: patients } = await supabase
      .from('patients')
      .select('id, name_surname, phone_number, date_of_birth, birthday_sent_year')
      .eq('psychologist_id', psych.id)
      .eq('is_active', true)
      .not('date_of_birth', 'is', null)

    if (!patients?.length) continue

    for (const patient of patients) {
      const dob = new Date(patient.date_of_birth)
      if (dob.getMonth() + 1 !== todayMonth || dob.getDate() !== todayDay) continue
      if (patient.birthday_sent_year === thisYear) continue

      const firstName = patient.name_surname.split(' ')[0]
      const message = `Merhaba ${firstName} 🎂 Bugün doğum gününüz! ${psych.full_name} olarak sizi tebrik ediyor, size huzurlu ve güzel bir gün diliyorum. Kendinize iyi bakın 🌿`

      try {
        await sendViaRailway(psych.id, patient.phone_number, message)

        await supabase
          .from('patients')
          .update({ birthday_sent_year: thisYear })
          .eq('id', patient.id)

        await new Promise(r => setTimeout(r, 2000))
      } catch {
        // Sessiz hata — bir sonraki hasta ile devam et
      }
    }
  }

  return { statusCode: 200 }
})
