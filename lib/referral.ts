import { createServiceClient } from '@/lib/supabase/server'
import { REFERRAL_RULES, VARIANT_MAP } from '@/lib/referral-rules'

export { REFERRAL_RULES }

async function updateSubscriptionVariant(subscriptionId: string, variantId: number) {
  const delays = [0, 1000, 3000]
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await new Promise(r => setTimeout(r, delays[i]))
    const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          id: String(subscriptionId),
          attributes: { variant_id: variantId, disable_prorations: true },
        },
      }),
    })
    if (res.ok) return
    if (i === delays.length - 1) {
      console.error(`[referral] LS variant update failed after ${delays.length} attempts — subscription: ${subscriptionId}, variant: ${variantId}`)
    }
  }
}

export async function calculateAndUpdateDiscount(psychologistId: string) {
  const supabase = await createServiceClient()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('plan_type, discount_percent, ls_subscription_id')
    .eq('id', psychologistId)
    .single()

  if (!psych || psych.plan_type === 'free') return

  const planKey = psych.plan_type === 'one' || psych.plan_type === 'baslangic' ? (psych.plan_type as 'one' | 'baslangic') : (psych.plan_type as 'pro')
  const rules = REFERRAL_RULES[planKey]

  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', psychologistId)
    .eq('status', 'active')

  const activeReferrals = count || 0
  const newDiscount = Math.min(activeReferrals * rules.discountPerReferral, 100)
  const isFree = activeReferrals >= rules.freeThreshold
  const finalDiscount = isFree ? 100 : newDiscount

  await supabase
    .from('psychologists')
    .update({ discount_percent: finalDiscount })
    .eq('id', psychologistId)

  if (psych.ls_subscription_id) {
    const variantId = VARIANT_MAP[psych.plan_type]?.[finalDiscount]
    if (variantId) {
      await updateSubscriptionVariant(psych.ls_subscription_id, variantId)
    }
  }

  return { activeReferrals, newDiscount: finalDiscount, isFree }
}

export async function activateReferral(referredId: string) {
  const supabase = await createServiceClient()

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
  const supabase = await createServiceClient()

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
