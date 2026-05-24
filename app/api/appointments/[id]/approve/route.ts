import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

interface Context {
  params: Promise<{ id: string }>
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

export async function POST(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: apt, error: fetchError } = await supabase
    .from('appointments')
    .select('id, appointment_date, psychologist_id, source, booking_name, booking_phone, patient_id, patient:patients(name_surname, phone_number)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (fetchError || !apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })

  // Booking page'den gelen randevu için hasta kaydı oluştur
  let patientId = apt.patient_id
  let patientPhone: string | null = null
  let patientName: string | null = null

  if (apt.source === 'booking_page' && !apt.patient_id && apt.booking_name && apt.booking_phone) {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const normalizedPhone = normalizePhone(apt.booking_phone)

    // Hasta zaten var mı?
    const { data: existing } = await serviceSupabase
      .from('patients')
      .select('id')
      .eq('psychologist_id', psychologist.id)
      .eq('phone_number', normalizedPhone)
      .maybeSingle()

    if (existing) {
      patientId = existing.id
    } else {
      // Yeni hasta oluştur
      const { data: newPatient } = await serviceSupabase
        .from('patients')
        .insert({
          psychologist_id: psychologist.id,
          name_surname: apt.booking_name,
          phone_number: normalizedPhone,
          is_active: true,
          anamnez_enabled: true,
        })
        .select('id')
        .single()

      if (newPatient) patientId = newPatient.id
    }

    // Randevuyu hasta id ile güncelle
    if (patientId) {
      await serviceSupabase
        .from('appointments')
        .update({ patient_id: patientId })
        .eq('id', id)
    }

    patientPhone = normalizePhone(apt.booking_phone)
    patientName = apt.booking_name
  } else {
    const patient = apt.patient as unknown as { name_surname: string; phone_number: string } | null
    patientPhone = patient?.phone_number ?? null
    patientName = patient?.name_surname ?? null
  }

  // Randevuyu onayla
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  const waUrl = process.env.WA_SERVICE_URL
  const waKey = process.env.WA_API_KEY

  if (patientPhone && waUrl && waKey) {
    const aptDate = new Date(apt.appointment_date).toLocaleString('tr-TR', {
      day: 'numeric', month: 'long', weekday: 'long',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    })

    // Onay mesajı gönder (fire-and-forget)
    fetch(`${waUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': waKey },
      body: JSON.stringify({
        psychologistId: psychologist.id,
        phone: normalizePhone(patientPhone),
        message: `Merhaba, randevunuz klinik tarafından onaylanmıştır. ${aptDate} randevu tarihinde görüşmek üzere.`,
      }),
    }).catch(() => {})

    // Booking page'den gelen yeni hastaya anamnez formu gönder
    if (apt.source === 'booking_page' && patientId) {
      const serviceSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: patient } = await serviceSupabase
        .from('patients')
        .select('anamnez_enabled, anamnez_sent_at')
        .eq('id', patientId)
        .single()

      if (patient?.anamnez_enabled && !patient?.anamnez_sent_at) {
        const token = crypto.randomBytes(8).toString('hex')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const { error: formError } = await serviceSupabase
          .from('anamnez_forms')
          .insert({
            patient_id: patientId,
            psychologist_id: psychologist.id,
            token,
            expires_at: expiresAt.toISOString(),
          })

        if (!formError) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seansify.com'
          const formUrl = `${baseUrl}/anamnez/${token}`

          fetch(`${waUrl}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': waKey },
            body: JSON.stringify({
              psychologistId: psychologist.id,
              phone: normalizePhone(patientPhone),
              message: `Merhaba ${patientName ?? ''}, randevunuzdan önce aşağıdaki formu doldurmanızı rica ederiz:\n${formUrl}`,
            }),
          }).catch(() => {})

          await serviceSupabase
            .from('patients')
            .update({ anamnez_sent_at: new Date().toISOString() })
            .eq('id', patientId)
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
