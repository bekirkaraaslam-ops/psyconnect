import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, referral_code, plan_type, discount_percent')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) return NextResponse.json({ error: 'Psikolog kaydı bulunamadı' }, { status: 404 })

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*, referred:referred_id(full_name)')
    .eq('referrer_id', psych.id)
    .order('created_at', { ascending: false })

  const activeCount = referrals?.filter(r => r.status === 'active').length || 0

  return NextResponse.json({
    referralCode: psych.referral_code,
    planType: psych.plan_type,
    discountPercent: psych.discount_percent,
    referrals: referrals || [],
    activeCount,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${psych.referral_code}`,
  })
}
