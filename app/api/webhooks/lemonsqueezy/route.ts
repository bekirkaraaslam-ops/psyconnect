import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { activateReferral, cancelReferral } from '@/lib/referral'

function verifyWebhook(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-signature') || ''

  if (!verifyWebhook(body, signature)) {
    return NextResponse.json({ error: 'Geçersiz imza' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const eventName = event.meta?.event_name
  const data = event.data?.attributes
  const customData = event.meta?.custom_data || {}

  const serviceSupabase = await createServiceClient()

  const psychologistId = customData.psychologist_id
  const variantId = data?.variant_id?.toString()

  const BASLANGIC_VARIANT = process.env.LEMONSQUEEZY_BASLANGIC_VARIANT_ID
  const PRO_VARIANT = process.env.LEMONSQUEEZY_PRO_VARIANT_ID

  const planType = variantId === PRO_VARIANT ? 'pro' : variantId === BASLANGIC_VARIANT ? 'baslangic' : null

  switch (eventName) {
    case 'subscription_created': {
      if (!psychologistId || !planType) break

      await serviceSupabase
        .from('psychologists')
        .update({
          plan_type: planType,
          ls_customer_id: data.customer_id?.toString(),
          ls_subscription_id: event.data?.id?.toString(),
          ls_subscription_status: data.status,
        })
        .eq('id', psychologistId)

      // Trial başlangıcında referral aktive etme — ödeme gerçekleşince aktive edilecek
      if (data.status !== 'on_trial') {
        await activateReferral(psychologistId)
      }
      break
    }

    case 'subscription_updated': {
      if (!psychologistId) break

      await serviceSupabase
        .from('psychologists')
        .update({
          ls_subscription_status: data.status,
          ...(planType && { plan_type: planType }),
        })
        .eq('id', psychologistId)
      break
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      if (!psychologistId) break

      await serviceSupabase
        .from('psychologists')
        .update({
          plan_type: 'free',
          ls_subscription_status: data.status,
        })
        .eq('id', psychologistId)

      await cancelReferral(psychologistId)
      break
    }

    case 'subscription_payment_success': {
      if (!psychologistId) break

      await serviceSupabase
        .from('psychologists')
        .update({ ls_subscription_status: 'active' })
        .eq('id', psychologistId)

      // Trial'dan ödemeye geçişte referral'ı aktive et
      await activateReferral(psychologistId)
      break
    }

    case 'subscription_payment_failed': {
      if (!psychologistId) break

      await serviceSupabase
        .from('psychologists')
        .update({ ls_subscription_status: 'past_due' })
        .eq('id', psychologistId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
