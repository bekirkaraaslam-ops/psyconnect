import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const { patient_id, appointment_date, duration_minutes, status } = body

  if (!patient_id || !appointment_date) {
    return NextResponse.json({ error: 'Hasta ve tarih zorunludur.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      psychologist_id: psychologist.id,
      patient_id,
      appointment_date,
      duration_minutes: duration_minutes ?? 50,
      status: status ?? 'waiting',
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

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  let query = supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('psychologist_id', psychologist!.id)
    .order('appointment_date')

  if (from) query = query.gte('appointment_date', from)
  if (to) query = query.lte('appointment_date', to)

  const { data } = await query
  return NextResponse.json(data)
}
