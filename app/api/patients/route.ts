import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { normalizePhone } from '@/lib/utils'
import { getLimits, isProPlan } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, plan_type')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!isProPlan(psychologist.plan_type)) {
    const limits = getLimits(psychologist.plan_type)
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', psychologist.id)
      .eq('is_active', true)
    if ((count ?? 0) >= limits.maxActivePatients) {
      return NextResponse.json(
        { error: 'PATIENT_LIMIT_REACHED', limit: limits.maxActivePatients },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const { name_surname, phone_number, date_of_birth, notes, anamnez_enabled } = body

  if (!name_surname || !phone_number) {
    return NextResponse.json({ error: 'Ad soyad ve telefon zorunludur.' }, { status: 400 })
  }

  const normalized = normalizePhone(phone_number)
  const notes_encrypted = notes ? encrypt(notes) : null

  const { data: existing } = await supabase
    .from('patients')
    .select('id, is_active')
    .eq('psychologist_id', psychologist.id)
    .eq('phone_number', normalized)
    .maybeSingle()

  if (existing) {
    if (existing.is_active) {
      return NextResponse.json({ error: 'Bu telefon numarası zaten kayıtlı.' }, { status: 409 })
    }
    // Silinmiş hasta — bilgileri güncelle ve yeniden aktifleştir
    const { data, error } = await supabase
      .from('patients')
      .update({
        name_surname,
        date_of_birth: date_of_birth || null,
        notes_encrypted,
        anamnez_enabled: anamnez_enabled === true,
        is_active: true,
      })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 200 })
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      psychologist_id: psychologist.id,
      name_surname,
      phone_number: normalized,
      date_of_birth: date_of_birth || null,
      notes_encrypted,
      anamnez_enabled: anamnez_enabled === true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const { data } = await supabase
    .from('patients')
    .select('id, name_surname, phone_number, date_of_birth, is_active, created_at')
    .eq('psychologist_id', psychologist!.id)
    .eq('is_active', true)
    .order('name_surname')

  return NextResponse.json(data)
}
