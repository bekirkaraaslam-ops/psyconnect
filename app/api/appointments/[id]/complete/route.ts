import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

interface Context {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, unvan, booking_slug')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .select('id, booking_phone, booking_name, patient_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Yorum linki oluştur ve WhatsApp gönder (arka planda)
  try {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Hasta telefon numarasını bul
    let phone: string | null = appointment.booking_phone ?? null
    let patientName: string | null = appointment.booking_name ?? null

    if (!phone && appointment.patient_id) {
      const { data: patient } = await serviceSupabase
        .from('patients')
        .select('phone_number, name_surname')
        .eq('id', appointment.patient_id)
        .single()
      phone = patient?.phone_number ?? null
      patientName = patient?.name_surname ?? null
    }

    if (phone) {
      // Yorum kaydı oluştur (token DB default ile üretilir)
      const initials = patientName
        ? patientName.split(' ').map((w: string) => w[0]?.toUpperCase() ?? '').slice(0, 2).join('.')
        : null

      const { data: yorumRow } = await serviceSupabase
        .from('psikolog_yorumlar')
        .insert({
          psychologist_id: psychologist.id,
          appointment_id: id,
          yildiz: 5,
          reviewer_init: initials,
        })
        .select('token')
        .single()

      if (yorumRow?.token) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seansify.com'
        const yorumUrl = `${baseUrl}/yorum/${yorumRow.token}`
        const psychName = `${psychologist.unvan ? psychologist.unvan + ' ' : ''}${psychologist.full_name}`

        const message = `Merhaba${patientName ? ' ' + patientName.split(' ')[0] : ''}! 😊\n\n${psychName} ile olan seanstan umarım fayda gördünüz.\n\nSizi değerlendirmeniz bizim için çok değerli:\n${yorumUrl}\n\n(1 dakika sürer, anonim kalabilirsiniz)`

        const waUrl = process.env.WA_SERVICE_URL
        if (waUrl) {
          await fetch(`${waUrl}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.WA_API_KEY ?? '' },
            body: JSON.stringify({ psychologistId: psychologist.id, phone, message }),
            signal: AbortSignal.timeout(8000),
          }).catch(() => null)
        }

        // Yorum gönderildi zamanını randevuya işle
        await serviceSupabase
          .from('appointments')
          .update({ yorum_gonderildi_at: new Date().toISOString() })
          .eq('id', id)
      }
    }
  } catch {
    // Yorum gönderimi başarısız olsa bile randevu tamamlandı
  }

  return NextResponse.json({ ok: true })
}
