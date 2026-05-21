import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ items: [] })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ items: [] })

  const { data } = await supabase
    .from('appointments')
    .select('id, appointment_date, duration_minutes, patient:patients(name_surname, phone_number)')
    .eq('psychologist_id', psychologist.id)
    .eq('status', 'seansify_pending')
    .order('appointment_date')

  return NextResponse.json({ items: data ?? [] })
}
