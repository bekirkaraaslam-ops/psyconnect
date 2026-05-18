import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { REFERRAL_RULES } from '../../lib/referral'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function processDiscounts() {
  const supabase = getSupabase()

  const { data: psychologists, error } = await supabase
    .from('psychologists')
    .select('id, plan_type, discount_percent')
    .in('plan_type', ['pro', 'baslangic'])

  if (error || !psychologists) return

  for (const psych of psychologists) {
    const rules = REFERRAL_RULES[psych.plan_type as 'pro' | 'baslangic']

    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', psych.id)
      .eq('status', 'active')

    const activeReferrals = count || 0
    const newDiscount = Math.min(activeReferrals * rules.discountPerReferral, 100)
    const isFree = activeReferrals >= rules.freeThreshold
    const finalDiscount = isFree ? 100 : newDiscount

    if (finalDiscount !== psych.discount_percent) {
      await supabase
        .from('psychologists')
        .update({ discount_percent: finalDiscount })
        .eq('id', psych.id)
    }
  }
}

export const handler = schedule('0 9 25 * *', async () => {
  await processDiscounts()
  return { statusCode: 200 }
})
