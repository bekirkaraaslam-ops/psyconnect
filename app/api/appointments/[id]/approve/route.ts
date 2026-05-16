import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    .select('id, appointment_date, psychologist_id, patient:patients(name_surname, phone_number)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (fetchError || !apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  const patient = apt.patient as unknown as { name_surname: string; phone_number: string } | null
  if (patient?.phone_number) {
    const aptDate = new Date(apt.appointment_date).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    })

    const waUrl = process.env.WA_SERVICE_URL
    const waKey = process.env.WA_API_KEY

    if (waUrl && waKey) {
      await fetch(`${waUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': waKey,
        },
        body: JSON.stringify({
          psychologistId: psychologist.id,
          phone: normalizePhone(patient.phone_number),
          message: `Merhaba, randevunuz klinik tarafından onaylanmıştır. ${aptDate} randevu tarihinde görüşmek üzere.`,
        }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true })
}
