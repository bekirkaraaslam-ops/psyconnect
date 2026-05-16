import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointment_id } = await req.json()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, is_connected, harita_linki, online_gorusme_linki, hosgeldiniz_mesaji')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Psikolog bulunamadı' }, { status: 404 })
  if (!psychologist.is_connected) return NextResponse.json({ error: 'WhatsApp bağlı değil' }, { status: 400 })

  const { data: apt } = await supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('id', appointment_id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })

  const patient = apt.patient as any
  const date = new Date(apt.appointment_date)
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
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

  const waUrl = process.env.WA_SERVICE_URL
  const waKey = process.env.WA_API_KEY

  if (!waUrl || !waKey) return NextResponse.json({ error: 'WA_SERVICE_URL veya WA_API_KEY eksik' }, { status: 500 })

  const res = await fetch(`${waUrl}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': waKey },
    body: JSON.stringify({
      psychologistId: psychologist.id,
      phone: normalizePhone(patient.phone_number),
      message,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Railway hatası: ${err}` }, { status: 500 })
  }

  // reminder_sent = true yap ki cron tekrar göndermesin + handler eşleşsin
  await supabase
    .from('appointments')
    .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
    .eq('id', appointment_id)

  return NextResponse.json({ ok: true, message: 'Mesaj gönderildi', to: patient.name_surname, phone: normalizePhone(patient.phone_number) })
}
