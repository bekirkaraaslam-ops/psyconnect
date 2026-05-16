import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Props) {
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

  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', id)
    .eq('psychologist_id', psychologist.id)
    .in('status', ['canceled', 'cancelled_by_patient'])

  return NextResponse.json({ cancelCount: count ?? 0 })
}
