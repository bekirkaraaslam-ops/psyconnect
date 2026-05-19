import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Context) {
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

  const { data } = await supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const body = await req.json()
  const { patient_id, appointment_date, duration_minutes, status, appointment_type, toplam_paket_seansi, mevcut_seans_no, is_first_session } = body

  const update: Record<string, unknown> = {}
  if (patient_id !== undefined) update.patient_id = patient_id
  if (appointment_date !== undefined) update.appointment_date = appointment_date
  if (duration_minutes !== undefined) update.duration_minutes = Number(duration_minutes)
  if (status !== undefined) update.status = status
  if (appointment_type !== undefined) update.appointment_type = appointment_type
  if (toplam_paket_seansi !== undefined) update.toplam_paket_seansi = toplam_paket_seansi ?? null
  if (mevcut_seans_no !== undefined) update.mevcut_seans_no = mevcut_seans_no ?? null
  if (is_first_session !== undefined) update.is_first_session = is_first_session

  const { data, error } = await supabase
    .from('appointments')
    .update(update)
    .eq('id', id)
    .eq('psychologist_id', psychologist!.id)
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

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const { data: apt, error } = await supabase
    .from('appointments')
    .update({ status: 'canceled' })
    .eq('id', id)
    .eq('psychologist_id', psychologist!.id)
    .select('appointment_date, psychologist_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Bekleme listesi cascade — fire and forget
  if (apt) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/waiting-list/cascade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        psychologist_id: apt.psychologist_id,
        slot_date: apt.appointment_date,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
