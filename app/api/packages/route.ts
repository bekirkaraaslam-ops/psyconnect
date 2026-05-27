import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getPsychologistId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  return data?.id ?? null
}

export async function GET() {
  const supabase = await createClient()
  const psychologistId = await getPsychologistId(supabase)
  if (!psychologistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('paket_sablonlari')
    .select('id, name, session_count, price_tl, is_active, sort_order')
    .eq('psychologist_id', psychologistId)
    .order('sort_order')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const psychologistId = await getPsychologistId(supabase)
  if (!psychologistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, session_count, price_tl } = await req.json()
  if (!name || !session_count || price_tl == null) {
    return NextResponse.json({ error: 'Ad, seans sayısı ve fiyat zorunludur.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('paket_sablonlari')
    .insert({ psychologist_id: psychologistId, name, session_count: Number(session_count), price_tl: Number(price_tl) })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
