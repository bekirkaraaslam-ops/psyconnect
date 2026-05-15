import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, is_connected')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Psikolog bulunamadı' }, { status: 404 })
  if (!psychologist.is_connected) return NextResponse.json({ error: 'WhatsApp bağlı değil' }, { status: 400 })

  // Gelecekteki ilk randevuyu bul (zaman sınırı yok — test için)
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, patient:patients(name_surname, phone_number)')
    .eq('psychologist_id', psychologist.id)
    .neq('status', 'canceled')
    .neq('status', 'completed')
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })
    .limit(1)

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ error: 'Gelecekte randevu bulunamadı' }, { status: 404 })
  }

  const apt = appointments[0] as any
  const patient = apt.patient
  const date = new Date(apt.appointment_date)
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })

  const message =
    `[TEST] Sayın ${patient.name_surname},\n\n` +
    `${dateStr} tarihinde saat *${timeStr}*'de ` +
    `*${psychologist.full_name}* ile randevunuz bulunmaktadır.\n\n` +
    `Randevunuzu iptal etmek veya değiştirmek isterseniz lütfen bizimle iletişime geçin.`

  const res = await fetch(`${process.env.WA_SERVICE_URL}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.WA_API_KEY!,
    },
    body: JSON.stringify({
      psychologistId: psychologist.id,
      phone: patient.phone_number,
      message,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Railway hatası: ${err}` }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: `Test mesajı gönderildi → ${patient.name_surname} (${patient.phone_number})`,
  })
}
