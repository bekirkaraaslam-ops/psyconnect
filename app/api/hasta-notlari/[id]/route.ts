import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

interface Props { params: Promise<{ id: string }> }

function safeDecrypt(val: string | null): string {
  if (!val) return ''
  try { return decrypt(val) } catch { return '' }
}

export async function GET(_req: NextRequest, { params }: Props) {
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

  const { data, error } = await supabase
    .from('hasta_notlari')
    .select('*')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id: data.id,
    hasta_id: data.hasta_id,
    seans_tarihi: data.seans_tarihi,
    seans_notu: safeDecrypt(data.seans_notu_encrypted),
    gelecek_plan: safeDecrypt(data.gelecek_plan_encrypted),
    ev_odevi: safeDecrypt(data.ev_odevi_encrypted),
    created_at: data.created_at,
    updated_at: data.updated_at,
  })
}

export async function PATCH(req: NextRequest, { params }: Props) {
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

  const body = await req.json()
  const { seans_tarihi, seans_notu, gelecek_plan, ev_odevi } = body

  const updateData: Record<string, string | null> = {}
  if (seans_tarihi !== undefined) updateData.seans_tarihi = seans_tarihi
  if (seans_notu !== undefined) updateData.seans_notu_encrypted = seans_notu ? encrypt(seans_notu) : null
  if (gelecek_plan !== undefined) updateData.gelecek_plan_encrypted = gelecek_plan ? encrypt(gelecek_plan) : null
  if (ev_odevi !== undefined) updateData.ev_odevi_encrypted = ev_odevi ? encrypt(ev_odevi) : null

  const { data, error } = await supabase
    .from('hasta_notlari')
    .update(updateData)
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .select('id, seans_tarihi, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Props) {
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

  const { error } = await supabase
    .from('hasta_notlari')
    .delete()
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
