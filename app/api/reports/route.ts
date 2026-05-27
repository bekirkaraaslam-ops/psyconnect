import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) return NextResponse.json({ error: 'Psikolog bulunamadı' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // YYYY-MM
  const now = new Date()
  const year = month ? parseInt(month.split('-')[0]) : now.getFullYear()
  const monthNum = month ? parseInt(month.split('-')[1]) : now.getMonth() + 1

  const startDate = new Date(year, monthNum - 1, 1).toISOString()
  const endDate = new Date(year, monthNum, 0, 23, 59, 59).toISOString()

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, appointment_date, status, appointment_type, ucret, odeme_durumu, odeme_tarihi, patient_id, booking_name, duration_minutes')
    .eq('psychologist_id', psych.id)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .order('appointment_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const apts = appointments ?? []

  // Patient adlarını çek
  const patientIds = [...new Set(apts.filter(a => a.patient_id).map(a => a.patient_id as string))]
  let patientMap: Record<string, string> = {}
  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from('patients')
      .select('id, name_surname')
      .in('id', patientIds)
    ;(patients ?? []).forEach(p => { patientMap[p.id] = p.name_surname })
  }

  const activeStatuses = ['confirmed', 'completed', 'seansify_pending']
  const cancelStatuses = ['canceled', 'cancelled_by_patient']

  const completed = apts.filter(a => a.status === 'completed')
  const active = apts.filter(a => activeStatuses.includes(a.status))
  const cancelled = apts.filter(a => cancelStatuses.includes(a.status))
  const noShow = apts.filter(a => a.status === 'no_show')

  const tahsilEdilen = apts
    .filter(a => a.odeme_durumu === 'odendi')
    .reduce((s, a) => s + (a.ucret ?? 0), 0)

  const bekleyen = apts
    .filter(a => a.odeme_durumu === 'bekliyor' && !cancelStatuses.includes(a.status))
    .reduce((s, a) => s + (a.ucret ?? 0), 0)

  const enriched = apts.map(a => ({
    ...a,
    patient_name: a.patient_id ? (patientMap[a.patient_id] ?? null) : (a.booking_name ?? null),
  }))

  return NextResponse.json({
    summary: {
      tamamlananSeans: completed.length,
      aktifRandevu: active.length,
      iptalVeGelmedi: cancelled.length + noShow.length,
      tahsilEdilen,
      bekleyenOdeme: bekleyen,
    },
    appointments: enriched,
  })
}
