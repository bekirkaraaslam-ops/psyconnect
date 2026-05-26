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

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ücret atanmış randevular (borç)
  const { data: aptRows } = await supabase
    .from('appointments')
    .select('id, appointment_date, ucret, odeme_durumu, odeme_tarihi, status')
    .eq('patient_id', id)
    .eq('psychologist_id', psych.id)
    .not('ucret', 'is', null)
    .order('appointment_date', { ascending: false })

  // Yapılan ödemeler
  const { data: odemeler } = await supabase
    .from('odemeler')
    .select('id, tutar, aciklama, odeme_tarihi, appointment_id')
    .eq('patient_id', id)
    .eq('psychologist_id', psych.id)
    .order('odeme_tarihi', { ascending: false })

  const totalBekleyen = (aptRows ?? [])
    .filter(a => a.odeme_durumu === 'bekliyor')
    .reduce((s: number, a: { ucret: number }) => s + (a.ucret ?? 0), 0)

  const totalOdenen = (odemeler ?? [])
    .reduce((s: number, o: { tutar: number }) => s + (o.tutar ?? 0), 0)

  return NextResponse.json({
    appointments: aptRows ?? [],
    odemeler: odemeler ?? [],
    totalBekleyen,
    totalOdenen,
  })
}

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { tutar, aciklama, appointment_id } = body
  if (!tutar || isNaN(Number(tutar))) {
    return NextResponse.json({ error: 'Geçersiz tutar' }, { status: 400 })
  }

  const { error } = await supabase
    .from('odemeler')
    .insert({
      patient_id: id,
      psychologist_id: psych.id,
      appointment_id: appointment_id ?? null,
      tutar: Number(tutar),
      aciklama: aciklama ?? null,
      odeme_tarihi: new Date().toISOString(),
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Eğer appointment_id varsa o randevunun odeme_durumu'nu güncelle
  if (appointment_id) {
    await supabase
      .from('appointments')
      .update({ odeme_durumu: 'odendi', odeme_tarihi: new Date().toISOString() })
      .eq('id', appointment_id)
      .eq('psychologist_id', psych.id)
  }

  return NextResponse.json({ ok: true })
}
