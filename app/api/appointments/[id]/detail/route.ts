import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'

interface Context {
  params: Promise<{ id: string }>
}

function safeDecrypt(val: string | null | undefined): string {
  if (!val) return ''
  try { return decrypt(val) } catch { return '' }
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

  const { data: apt } = await supabase
    .from('appointments')
    .select('*, patient:patients(id, name_surname, phone_number)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: lastNote } = await supabase
    .from('hasta_notlari')
    .select('seans_tarihi, soap_s_encrypted, soap_o_encrypted, soap_a_encrypted, soap_p_encrypted, seans_notu_encrypted')
    .eq('psychologist_id', psychologist.id)
    .eq('hasta_id', apt.patient?.id)
    .order('seans_tarihi', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastSoap = lastNote ? {
    tarih: lastNote.seans_tarihi,
    s: safeDecrypt(lastNote.soap_s_encrypted),
    o: safeDecrypt(lastNote.soap_o_encrypted),
    a: safeDecrypt(lastNote.soap_a_encrypted),
    p: safeDecrypt(lastNote.soap_p_encrypted),
    genel: safeDecrypt(lastNote.seans_notu_encrypted),
  } : null

  return NextResponse.json({ apt, lastSoap })
}
