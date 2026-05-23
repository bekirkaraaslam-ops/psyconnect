import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function randomDelay() {
  // 60-180 saniye arası rastgele gecikme
  const ms = Math.floor(Math.random() * 120_000) + 60_000
  return new Promise(resolve => setTimeout(resolve, ms))
}

function buildWelcomeMessage(patientName: string, psychologistName: string): string {
  return `Merhaba ${patientName} 🌿

${psychologistName} kliniğine hoş geldiniz. Bundan sonra randevularınızla ilgili tüm bildirimler bu hat üzerinden WhatsApp ile iletilecek.

📅 Randevu almak için:
"randevu" yazmanız yeterli. Size müsait günler sunulur; birini seçtikten sonra adınızı ve soyadınızı yazarsanız randevunuz oluşturulur.

🔔 Hatırlatıcılar:
Randevunuzdan önce otomatik hatırlatma alırsınız. Gelen mesajda "ONAYLA" veya "İPTAL" yazarak randevunuzu tek adımda yönetebilirsiniz.

Bu hat otomatik bildirim sistemi üzerinden çalışır. Psikologunuzla doğrudan iletişim için lütfen kliniği arayın.

Seansify`
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

// Her 30 dakikada bir çalışır
const handler = schedule('*/30 * * * *', async () => {
  const supabase = getSupabase()

  // welcome_sent_at NULL olan ve en az 2 dakika önce oluşturulan hastaları bul
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const { data: patients, error } = await supabase
    .from('patients')
    .select(`
      id,
      name_surname,
      phone_number,
      psychologist_id,
      psychologist:psychologists(id, full_name, is_connected)
    `)
    .is('welcome_sent_at', null)
    .eq('is_active', true)
    .lt('created_at', cutoff)
    .limit(20)

  if (error) {
    console.error('[send-welcomes] Sorgu hatası:', error.message)
    return { statusCode: 500 }
  }

  if (!patients || patients.length === 0) {
    console.log('[send-welcomes] Bekleyen hasta yok.')
    return { statusCode: 200 }
  }

  console.log(`[send-welcomes] ${patients.length} hasta için karşılama mesajı gönderilecek.`)

  for (const patient of patients) {
    const psych = patient.psychologist as any
    if (!psych?.is_connected) {
      console.log(`[send-welcomes] ${patient.id} — psikolog WA bağlı değil, atlandı.`)
      continue
    }

    try {
      await randomDelay()

      const message = buildWelcomeMessage(
        patient.name_surname,
        psych.full_name ?? 'Psikologunuz'
      )

      await sendViaRailway(psych.id, patient.phone_number, message)

      await supabase
        .from('patients')
        .update({ welcome_sent_at: new Date().toISOString() })
        .eq('id', patient.id)

      console.log(`[send-welcomes] ✓ ${patient.name_surname} — mesaj gönderildi.`)
    } catch (err) {
      console.error(`[send-welcomes] ✗ ${patient.name_surname} — hata:`, err)
      // Hata durumunda sent_at güncellenmez, bir sonraki çalışmada tekrar denenecek
    }
  }

  return { statusCode: 200 }
})

export { handler }
