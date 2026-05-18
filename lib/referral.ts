import { createClient } from '@/lib/supabase/server'
import { REFERRAL_RULES } from '@/lib/referral-rules'

export { REFERRAL_RULES }

export async function calculateAndUpdateDiscount(psychologistId: string) {
  const supabase = await createClient()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('plan_type, discount_percent')
    .eq('id', psychologistId)
    .single()

  if (!psych || psych.plan_type === 'free') return

  const rules = REFERRAL_RULES[psych.plan_type as 'pro' | 'baslangic']

  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', psychologistId)
    .eq('status', 'active')

  const activeReferrals = count || 0
  const newDiscount = Math.min(activeReferrals * rules.discountPerReferral, 100)
  const isFree = activeReferrals >= rules.freeThreshold

  await supabase
    .from('psychologists')
    .update({ discount_percent: isFree ? 100 : newDiscount })
    .eq('id', psychologistId)

  return { activeReferrals, newDiscount: isFree ? 100 : newDiscount, isFree }
}

export async function activateReferral(referredId: string) {
  const supabase = await createClient()

  const { data: referral } = await supabase
    .from('referrals')
    .update({ status: 'active', activated_at: new Date().toISOString() })
    .eq('referred_id', referredId)
    .eq('status', 'pending')
    .select()
    .single()

  if (referral) {
    await calculateAndUpdateDiscount(referral.referrer_id)
  }
}

export async function cancelReferral(referredId: string) {
  const supabase = await createClient()

  const { data: referral } = await supabase
    .from('referrals')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('referred_id', referredId)
    .eq('status', 'active')
    .select()
    .single()

  if (referral) {
    await calculateAndUpdateDiscount(referral.referrer_id)
  }
}
