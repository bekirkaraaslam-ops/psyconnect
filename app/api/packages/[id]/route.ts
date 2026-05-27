import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

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

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const psychologistId = await getPsychologistId(supabase)
  if (!psychologistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (body.name !== undefined) update.name = body.name
  if (body.session_count !== undefined) update.session_count = Number(body.session_count)
  if (body.price_tl !== undefined) update.price_tl = Number(body.price_tl)
  if (body.is_active !== undefined) update.is_active = body.is_active
  if (body.sort_order !== undefined) update.sort_order = Number(body.sort_order)

  const { data, error } = await supabase
    .from('paket_sablonlari')
    .update(update)
    .eq('id', id)
    .eq('psychologist_id', psychologistId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const psychologistId = await getPsychologistId(supabase)
  if (!psychologistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('paket_sablonlari')
    .delete()
    .eq('id', id)
    .eq('psychologist_id', psychologistId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
