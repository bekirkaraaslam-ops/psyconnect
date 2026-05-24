import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — dashboard: psikologun bekleme listesini getir
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('psychologist_id', psychologist.id)
    .in('status', ['waiting', 'offered'])
    .order('created_at')

  return NextResponse.json(data ?? [])
}

// POST — public: bekleme listesine kayıt (anonim erişim, service role gerekli)
export async function POST(req: NextRequest) {
  const supabase = getServiceSupabase()
  const body = await req.json()
  const {
    psychologist_id,
    name_surname,
    phone_number,
    preferred_days,
    preferred_time_start,
    preferred_time_end,
    notes,
  } = body

  if (!psychologist_id || !name_surname || !phone_number) {
    return NextResponse.json({ error: 'Ad, telefon ve psikolog zorunludur.' }, { status: 400 })
  }

  // Normalize phone
  const digits = String(phone_number).replace(/\D/g, '')
  let normalized = digits
  if (digits.startsWith('0')) normalized = '90' + digits.slice(1)
  else if (digits.startsWith('5')) normalized = '90' + digits
  else if (!digits.startsWith('90')) normalized = '90' + digits

  const { data, error } = await supabase
    .from('waiting_list')
    .insert({
      psychologist_id,
      name_surname,
      phone_number: normalized,
      preferred_days: preferred_days ?? [],
      preferred_time_start: preferred_time_start ?? 9,
      preferred_time_end: preferred_time_end ?? 18,
      notes: notes || null,
      status: 'waiting',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
