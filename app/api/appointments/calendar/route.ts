import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type AppointmentStatus = 'waiting' | 'confirmed' | 'canceled' | 'completed' | 'cancelled_by_patient'

function statusColor(status: AppointmentStatus): { backgroundColor: string; borderColor: string } {
  switch (status) {
    case 'confirmed':
      return { backgroundColor: '#16a34a', borderColor: '#15803d' }
    case 'cancelled_by_patient':
    case 'canceled':
      return { backgroundColor: '#dc2626', borderColor: '#b91c1c' }
    case 'waiting':
      return { backgroundColor: '#4a7c6f', borderColor: '#3d6b5f' }
    case 'completed':
      return { backgroundColor: '#94a3b8', borderColor: '#7f8ea3' }
    default:
      return { backgroundColor: '#4a7c6f', borderColor: '#3d6b5f' }
  }
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

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = new URL(req.url)
  const from = url.searchParams.get('start')
  const to = url.searchParams.get('end')

  let query = supabase
    .from('appointments')
    .select('id, appointment_date, duration_minutes, status, patient:patients(name_surname)')
    .eq('psychologist_id', psychologist.id)
    .order('appointment_date')

  if (from) query = query.gte('appointment_date', from)
  if (to) query = query.lte('appointment_date', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const events = (data ?? []).map((apt) => {
    const start = new Date(apt.appointment_date)
    const end = new Date(start.getTime() + (apt.duration_minutes ?? 50) * 60 * 1000)
    const colors = statusColor(apt.status as AppointmentStatus)
    const patient = apt.patient as { name_surname: string } | null

    return {
      id: apt.id,
      title: patient?.name_surname ?? 'Hasta',
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      textColor: '#ffffff',
      extendedProps: {
        status: apt.status,
      },
    }
  })

  return NextResponse.json(events)
}
