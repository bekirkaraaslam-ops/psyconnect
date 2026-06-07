import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { patient_id, scale_id, appointment_id } = await req.json()
  if (!patient_id || !scale_id) {
    return NextResponse.json({ error: 'patient_id ve scale_id gerekli' }, { status: 400 })
  }

  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patient_id)
    .eq('psychologist_id', psychologist.id)
    .single()
  if (!patient) return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })

  const service = getServiceSupabase()

  // Önceki doldurulmamış yanıtı iptal et (aynı ölçek + hasta)
  await service
    .from('scale_responses')
    .update({ expires_at: new Date().toISOString() })
    .eq('patient_id', patient_id)
    .eq('scale_id', scale_id)
    .is('filled_at', null)

  const token = crypto.randomBytes(10).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await service.from('scale_responses').insert({
    patient_id,
    psychologist_id: psychologist.id,
    scale_id,
    appointment_id: appointment_id ?? null,
    token,
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seansify.app'
  const link = `${baseUrl}/olcek/${token}`

  // WhatsApp bildirimi — fire and forget
  try {
    const { data: patient } = await service
      .from('patients')
      .select('phone_number, name_surname')
      .eq('id', patient_id)
      .maybeSingle()

    const { data: psych2 } = await service
      .from('psychologists')
      .select('id, is_connected')
      .eq('id', psychologist.id)
      .maybeSingle()

    if (patient?.phone_number && psych2?.is_connected) {
      const { data: scale } = await service
        .from('scales')
        .select('name')
        .eq('id', scale_id)
        .maybeSingle()
      const scaleName = scale?.name ?? 'değerlendirme ölçeği'
      const waMsg = `Merhaba! Psikologunuz sizin için bir *${scaleName}* gönderdi.\n\nLütfen aşağıdaki linkten doldurun:\n${link}\n\n_(Geçerlilik süresi: 7 gün)_`
      fetch(`${process.env.WA_SERVICE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.WA_API_KEY! },
        body: JSON.stringify({ psychologistId: psych2.id, phone: patient.phone_number, message: waMsg }),
      }).catch(() => {})
    }
  } catch { /* WA hata sessizce geç */ }

  return NextResponse.json({ link })
}
