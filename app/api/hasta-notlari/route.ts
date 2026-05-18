import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'

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
  const hastaId = url.searchParams.get('hasta_id')
  if (!hastaId) return NextResponse.json({ error: 'hasta_id gerekli' }, { status: 400 })

  const { data, error } = await supabase
    .from('hasta_notlari')
    .select('id, seans_tarihi, created_at, updated_at')
    .eq('hasta_id', hastaId)
    .eq('psychologist_id', psychologist.id)
    .order('seans_tarihi', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

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
  const { hasta_id, seans_tarihi, seans_notu, gelecek_plan, ev_odevi, soap_s, soap_o, soap_a, soap_p } = body

  if (!hasta_id || !seans_tarihi) {
    return NextResponse.json({ error: 'hasta_id ve seans_tarihi zorunludur.' }, { status: 400 })
  }

  const insertData: Record<string, string> = {
    psychologist_id: psychologist.id,
    hasta_id,
    seans_tarihi,
  }
  if (seans_notu) insertData.seans_notu_encrypted = encrypt(seans_notu)
  if (gelecek_plan) insertData.gelecek_plan_encrypted = encrypt(gelecek_plan)
  if (ev_odevi) insertData.ev_odevi_encrypted = encrypt(ev_odevi)
  if (soap_s) insertData.soap_s_encrypted = encrypt(soap_s)
  if (soap_o) insertData.soap_o_encrypted = encrypt(soap_o)
  if (soap_a) insertData.soap_a_encrypted = encrypt(soap_a)
  if (soap_p) insertData.soap_p_encrypted = encrypt(soap_p)

  const { data, error } = await supabase
    .from('hasta_notlari')
    .insert(insertData)
    .select('id, seans_tarihi, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
