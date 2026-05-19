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

  const { patient_id } = await req.json()
  if (!patient_id) return NextResponse.json({ error: 'patient_id gerekli' }, { status: 400 })

  // Hastanın bu psikologun hastası olduğunu doğrula
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patient_id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!patient) return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })

  const service = getServiceSupabase()

  // Önceki dolduruılmamış formu iptal et (expires_at'i geçmişe çek)
  await service
    .from('anamnez_forms')
    .update({ expires_at: new Date().toISOString() })
    .eq('patient_id', patient_id)
    .is('filled_at', null)

  const token     = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await service.from('anamnez_forms').insert({
    patient_id,
    psychologist_id: psychologist.id,
    token,
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seansify.app'
  const link    = `${baseUrl}/anamnez/${token}`

  return NextResponse.json({ link })
}
