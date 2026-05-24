import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateAndUpdateDiscount } from '@/lib/referral'

const ADMIN_SECRET = process.env.ADMIN_SECRET

export async function POST(req: NextRequest) {
  const { secret, psychologist_id } = await req.json()

  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (!psychologist_id) {
    return NextResponse.json({ error: 'psychologist_id gerekli' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: before } = await supabase
    .from('psychologists')
    .select('plan_type, discount_percent, ls_subscription_id')
    .eq('id', psychologist_id)
    .single()

  const result = await calculateAndUpdateDiscount(psychologist_id)

  const { data: after } = await supabase
    .from('psychologists')
    .select('discount_percent')
    .eq('id', psychologist_id)
    .single()

  return NextResponse.json({
    before,
    after,
    result,
    message: 'calculateAndUpdateDiscount çalıştırıldı — LS panelinden variant değişimini kontrol et',
  })
}
