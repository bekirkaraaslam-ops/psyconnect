import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ pending: [], awaitingCompletion: [] })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ pending: [], awaitingCompletion: [] })

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  const now = new Date().toISOString()

  const [{ data: pending }, { data: recent }] = await Promise.all([
    // Booking page'den gelen onay bekleyen talepler
    supabase
      .from('appointments')
      .select('id, appointment_date, duration_minutes, patient:patients(name_surname, phone_number)')
      .eq('psychologist_id', psychologist.id)
      .eq('status', 'seansify_pending')
      .order('appointment_date'),

    // Son 6 saat içinde başlamış, hâlâ tamamlanmamış onaylı/bekleyen randevular
    supabase
      .from('appointments')
      .select('id, appointment_date, duration_minutes, patient:patients(name_surname)')
      .eq('psychologist_id', psychologist.id)
      .in('status', ['confirmed', 'waiting'])
      .gte('appointment_date', sixHoursAgo)
      .lte('appointment_date', now)
      .order('appointment_date'),
  ])

  // Randevu bitiş saati + 50 dakika geçmişleri filtrele
  const awaitingCompletion = (recent ?? []).filter(a => {
    const endTime = new Date(a.appointment_date).getTime() + (a.duration_minutes ?? 50) * 60 * 1000
    return endTime + 50 * 60 * 1000 < Date.now()
  })

  return NextResponse.json({ pending: pending ?? [], awaitingCompletion })
}
