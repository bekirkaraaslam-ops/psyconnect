import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Context {
  params: Promise<{ token: string }>
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { token } = await params
  const supabase = getSupabase()

  const { data: form } = await supabase
    .from('onam_formlar')
    .select('id, expires_at, filled_at, patient:patients(name_surname)')
    .eq('token', token)
    .maybeSingle()

  if (!form) return NextResponse.json({ status: 'invalid' })
  if (new Date(form.expires_at) < new Date()) return NextResponse.json({ status: 'expired' })
  if (form.filled_at) return NextResponse.json({ status: 'filled' })

  const patientName = (form.patient as any)?.name_surname ?? ''
  return NextResponse.json({ status: 'ready', patientName })
}

export async function POST(req: NextRequest, { params }: Context) {
  const { token } = await params
  const supabase = getSupabase()

  const { data: form } = await supabase
    .from('onam_formlar')
    .select('id, expires_at, filled_at')
    .eq('token', token)
    .maybeSingle()

  if (!form) return NextResponse.json({ error: 'Geçersiz link' }, { status: 404 })
  if (new Date(form.expires_at) < new Date()) return NextResponse.json({ error: 'Linkin süresi dolmuş' }, { status: 410 })
  if (form.filled_at) return NextResponse.json({ error: 'Form zaten doldurulmuş' }, { status: 409 })

  const body = await req.json()
  const { imza_text } = body
  if (!imza_text?.trim()) return NextResponse.json({ error: 'İmza gereklidir' }, { status: 400 })

  const { error } = await supabase
    .from('onam_formlar')
    .update({ filled_at: new Date().toISOString(), imza_text: imza_text.trim() })
    .eq('id', form.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
