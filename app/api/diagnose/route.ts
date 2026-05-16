import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, phone_number, is_connected')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Psikolog bulunamadı' }, { status: 404 })

  const waUrl = process.env.WA_SERVICE_URL
  const waKey = process.env.WA_API_KEY

  let waHealth = false
  let waStatus = 'idle'
  try {
    const healthRes = await fetch(`${waUrl}/health`, { headers: { 'x-api-key': waKey! }, signal: AbortSignal.timeout(5000) })
    waHealth = healthRes.ok
    const statusRes = await fetch(`${waUrl}/status/${psychologist.id}`, { headers: { 'x-api-key': waKey! }, signal: AbortSignal.timeout(5000) })
    const statusData = await statusRes.json()
    waStatus = statusData.status
  } catch {}

  const now = new Date().toISOString()
  const { data: pendingApts } = await supabase
    .from('appointments')
    .select('id, appointment_date, patient:patients(name_surname)')
    .eq('psychologist_id', psychologist.id)
    .eq('reminder_sent', false)
    .neq('status', 'canceled')
    .neq('status', 'completed')
    .gt('appointment_date', now)
    .order('appointment_date')
    .limit(5)

  return NextResponse.json({
    psychologist: {
      name: psychologist.full_name,
      phone: psychologist.phone_number,
      is_connected: psychologist.is_connected,
    },
    whatsapp: {
      service_reachable: waHealth,
      session_status: waStatus,
      wa_service_url: waUrl || 'TANIMLANMADI',
    },
    env: {
      WA_SERVICE_URL: !!process.env.WA_SERVICE_URL,
      WA_API_KEY: !!process.env.WA_API_KEY,
    },
    pending_reminders: (pendingApts || []).map((a: any) => ({
      id: a.id,
      date: a.appointment_date,
      patient: a.patient?.name_surname,
    })),
  })
}
