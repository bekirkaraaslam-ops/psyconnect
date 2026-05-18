import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { normalizePhone } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name_surname, phone_number, date_of_birth, notes, anamnez_enabled } = body

  if (!name_surname || !phone_number) {
    return NextResponse.json({ error: 'Ad soyad ve telefon zorunludur.' }, { status: 400 })
  }

  const normalized = normalizePhone(phone_number)
  const notes_encrypted = notes ? encrypt(notes) : null

  const { data, error } = await supabase
    .from('patients')
    .insert({
      psychologist_id: psychologist.id,
      name_surname,
      phone_number: normalized,
      date_of_birth: date_of_birth || null,
      notes_encrypted,
      anamnez_enabled: anamnez_enabled === true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const { data } = await supabase
    .from('patients')
    .select('id, name_surname, phone_number, date_of_birth, is_active, created_at')
    .eq('psychologist_id', psychologist!.id)
    .eq('is_active', true)
    .order('name_surname')

  return NextResponse.json(data)
}
