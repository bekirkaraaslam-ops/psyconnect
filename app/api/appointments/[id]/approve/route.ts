import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

interface Context {
  params: Promise<{ id: string }>
}

async function sendWithRetry(waUrl: string, waKey: string, psychologistId: string, phone: string, message: string, retries = 2, replyJid?: string | null) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${waUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': waKey },
        body: JSON.stringify({ psychologistId, phone, message, replyJid: replyJid ?? undefined }),
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) return
      console.warn(`[sendWithRetry] attempt ${attempt + 1} failed: HTTP ${res.status}`)
    } catch (e) {
      console.warn(`[sendWithRetry] attempt ${attempt + 1} error:`, e)
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
  }
  console.error(`[sendWithRetry] all attempts failed for ${phone}`)
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Body'den ucret oku (opsiyonel)
  let ucret: number | null = null
  try {
    const body = await req.json()
    if (body?.ucret != null && !isNaN(Number(body.ucret))) ucret = Number(body.ucret)
  } catch { /* body boş olabilir */ }

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: apt, error: fetchError } = await supabase
    .from('appointments')
    .select('id, appointment_date, psychologist_id, source, booking_name, booking_phone, patient_id, patient:patients(name_surname, phone_number, whatsapp_jid)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (fetchError || !apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })

  // Booking page'den gelen randevu için hasta kaydı oluştur
  let patientId = apt.patient_id
  let patientPhone: string | null = null
  let patientName: string | null = null
  let patientWaJid: string | null = null

  if (apt.source === 'booking_page' && !apt.patient_id && apt.booking_name && apt.booking_phone) {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const normalizedPhone = normalizePhone(apt.booking_phone)

    const { data: existing } = await serviceSupabase
      .from('patients')
      .select('id')
      .eq('psychologist_id', psychologist.id)
      .eq('phone_number', normalizedPhone)
      .maybeSingle()

    if (existing) {
      patientId = existing.id
    } else {
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

    if (patientId) {
      await serviceSupabase
        .from('appointments')
        .update({ patient_id: patientId })
        .eq('id', id)
    }

    patientPhone = normalizePhone(apt.booking_phone)
    patientName = apt.booking_name
  } else {
    const patient = apt.patient as unknown as { name_surname: string; phone_number: string; whatsapp_jid?: string | null } | null
    patientPhone = patient?.phone_number ?? null
    patientName = patient?.name_surname ?? null
    patientWaJid = patient?.whatsapp_jid ?? null
  }

  // Randevuyu onayla + ücret kaydet
  const updatePayload: Record<string, unknown> = { status: 'confirmed' }
  if (ucret != null) {
    updatePayload.ucret = ucret
    updatePayload.odeme_durumu = 'bekliyor'
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update(updatePayload)
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

    // Onay mesajı
    await sendWithRetry(waUrl, waKey, psychologist.id, normalizePhone(patientPhone),
      `Merhaba, randevunuz klinik tarafından onaylanmıştır. ${aptDate} randevu tarihinde görüşmek üzere.`,
      2, patientWaJid
    )

    // Booking page'den gelen yeni hastaya anamnez + onam formu gönder
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

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seansify.com'
      const links: string[] = []

      // Anamnez formu
      if (patient?.anamnez_enabled && !patient?.anamnez_sent_at) {
        const token = crypto.randomBytes(8).toString('hex')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const { error: anamnezError } = await serviceSupabase
          .from('anamnez_forms')
          .insert({
            patient_id: patientId,
            psychologist_id: psychologist.id,
            token,
            expires_at: expiresAt.toISOString(),
          })

        if (!anamnezError) {
          links.push(`📋 Anamnez Formu: ${baseUrl}/anamnez/${token}`)
          await serviceSupabase
            .from('patients')
            .update({ anamnez_sent_at: new Date().toISOString() })
            .eq('id', patientId)
        }
      }

      // Onam formu (her yeni hasta için oluştur)
      const { data: existingOnam } = await serviceSupabase
        .from('onam_formlar')
        .select('id')
        .eq('patient_id', patientId)
        .maybeSingle()

      if (!existingOnam) {
        const onamToken = crypto.randomBytes(8).toString('hex')
        const onamExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const { error: onamError } = await serviceSupabase
          .from('onam_formlar')
          .insert({
            patient_id: patientId,
            psychologist_id: psychologist.id,
            token: onamToken,
            expires_at: onamExpires.toISOString(),
          })

        if (!onamError) {
          links.push(`✍️ Onam Formu: ${baseUrl}/onam/${onamToken}`)
        }
      }

      if (links.length > 0) {
        await sendWithRetry(waUrl, waKey, psychologist.id, normalizePhone(patientPhone),
          `Merhaba ${patientName ?? ''}, ilk randevunuzdan önce aşağıdaki formları doldurmanızı rica ederiz. Formlar yalnızca bir kez doldurulmalıdır:\n\n${links.join('\n\n')}\n\nFormlar hakkında herhangi bir sorunuz olursa lütfen bize bildirin. Görüşmek üzere!`,
          2, patientWaJid
        )
      }
    }
  }

  return NextResponse.json({ ok: true })
}
