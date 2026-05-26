import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id: patientId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, varsayilan_seans_ucreti')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: paket } = await supabase
    .from('seans_paketleri')
    .select('id, birim_fiyat, kullanilan_seans, toplam_seans')
    .eq('patient_id', patientId)
    .eq('psychologist_id', psych.id)
    .eq('aktif', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    paket: paket ?? null,
    varsayilanUcret: psych.varsayilan_seans_ucreti ?? null,
  })
}

export async function POST(req: NextRequest, { params }: Context) {
  const { id: patientId } = await params
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
  const { toplam_seans, birim_fiyat } = body

  if (!toplam_seans || !birim_fiyat) {
    return NextResponse.json({ error: 'toplam_seans ve birim_fiyat zorunludur.' }, { status: 400 })
  }

  // Mevcut aktif paketi pasife al
  await supabase
    .from('seans_paketleri')
    .update({ aktif: false })
    .eq('patient_id', patientId)
    .eq('psychologist_id', psych.id)
    .eq('aktif', true)

  const { error } = await supabase.from('seans_paketleri').insert({
    patient_id: patientId,
    psychologist_id: psych.id,
    toplam_seans: Number(toplam_seans),
    birim_fiyat: Number(birim_fiyat),
    kullanilan_seans: 0,
    aktif: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
