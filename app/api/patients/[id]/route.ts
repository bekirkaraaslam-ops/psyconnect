import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { normalizePhone } from '@/lib/utils'

interface Context {
  params: Promise<{ id: string }>
}

async function getPsychologistId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', userId)
    .single()
  return data?.id
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const psychologistId = await getPsychologistId(supabase, user.id)
  if (!psychologistId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name_surname, phone_number, date_of_birth, notes } = body

  const update: Record<string, unknown> = {}
  if (name_surname) update.name_surname = name_surname
  if (phone_number) update.phone_number = normalizePhone(phone_number)
  if (date_of_birth !== undefined) update.date_of_birth = date_of_birth || null
  if (notes !== undefined) update.notes_encrypted = notes ? encrypt(notes) : null

  const { data, error } = await supabase
    .from('patients')
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const psychologistId = await getPsychologistId(supabase, user.id)
  if (!psychologistId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft delete
  const { error } = await supabase
    .from('patients')
    .update({ is_active: false })
    .eq('id', id)
    .eq('psychologist_id', psychologistId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
