import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

  const { planType, referralCode } = await req.json()

  const variantId = planType === 'pro'
    ? process.env.LEMONSQUEEZY_PRO_VARIANT_ID
    : process.env.LEMONSQUEEZY_BASLANGIC_VARIANT_ID

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name, referred_by_code')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) return NextResponse.json({ error: 'Psikolog kaydı bulunamadı' }, { status: 404 })

  if (referralCode && !psych.referred_by_code) {
    const { data: referrer } = await supabase
      .from('psychologists')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .single()

    if (referrer && referrer.id !== psych.id) {
      await supabase
        .from('psychologists')
        .update({ referred_by_code: referralCode.toUpperCase() })
        .eq('id', psych.id)

      await supabase.from('referrals').upsert({
        referrer_id: referrer.id,
        referred_id: psych.id,
        referral_code: referralCode.toUpperCase(),
        status: 'pending',
      }, { onConflict: 'referred_id' })
    }
  }

  const checkoutBody = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          custom: {
            psychologist_id: psych.id,
          },
          email: user.email,
          name: psych.full_name || '',
          billing_address: {
            country: 'TR',
          },
        },
        checkout_options: {
          embed: false,
        },
        product_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        },
      },
      relationships: {
        store: {
          data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID },
        },
        variant: {
          data: { type: 'variants', id: variantId },
        },
      },
    },
  }

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify(checkoutBody),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const result = await response.json()
  const checkoutUrl = result.data?.attributes?.url

  return NextResponse.json({ url: checkoutUrl })
}
