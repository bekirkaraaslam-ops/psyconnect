import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Her 5 dakikada bir çalışır: süresi geçmiş teklifleri bulur ve cascade devam ettirir
export const handler = schedule('*/5 * * * *', async () => {
  const supabase = getSupabase()
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data: expired } = await supabase
    .from('waiting_list')
    .select('id, psychologist_id, offered_slot')
    .eq('status', 'offered')
    .eq('offer_status', 'pending')
    .lt('offer_sent_at', cutoff)

  if (!expired?.length) return { statusCode: 200 }

  for (const entry of expired) {
    // Teklifi süresi dolmuş olarak işaretle, tekrar "waiting" durumuna al
    await supabase
      .from('waiting_list')
      .update({ status: 'waiting', offer_status: 'expired', offered_slot: null, offer_sent_at: null })
      .eq('id', entry.id)

    // Sonraki kişiye cascade
    if (entry.offered_slot && entry.psychologist_id) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/waiting-list/cascade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            psychologist_id: entry.psychologist_id,
            slot_date: entry.offered_slot,
          }),
        })
      } catch {
        // Sessiz hata
      }
    }
  }

  return { statusCode: 200 }
})
