import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const WA_URL = process.env.WA_SERVICE_URL
const WA_KEY = process.env.WA_API_KEY

async function isSocketAlive(psychologistId: string): Promise<boolean> {
  try {
    const res = await fetch(`${WA_URL}/status/${psychologistId}`, {
      headers: { 'x-api-key': WA_KEY! },
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.connected === true
  } catch {
    return false
  }
}

async function triggerReconnect(psychologistId: string): Promise<boolean> {
  try {
    const res = await fetch(`${WA_URL}/connect/${psychologistId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': WA_KEY! },
    })
    return res.ok
  } catch {
    return false
  }
}

// Her 5 dakikada bir çalışır — socket düşmüş psikologları yeniden bağlar
const handler = schedule('*/5 * * * *', async () => {
  if (!WA_URL || !WA_KEY) {
    console.log('[reconnect-wa] WA_SERVICE_URL veya WA_API_KEY tanımlı değil, atlandı.')
    return { statusCode: 200 }
  }

  const supabase = getSupabase()

  const { data: psychologists, error } = await supabase
    .from('psychologists')
    .select('id, full_name')
    .eq('is_connected', true)

  if (error) {
    console.error('[reconnect-wa] Sorgu hatası:', error.message)
    return { statusCode: 500 }
  }

  if (!psychologists?.length) {
    return { statusCode: 200 }
  }

  for (const psych of psychologists) {
    const alive = await isSocketAlive(psych.id)

    if (!alive) {
      console.log(`[reconnect-wa] Socket düşmüş → ${psych.full_name}, yeniden bağlanıyor...`)
      const ok = await triggerReconnect(psych.id)

      if (ok) {
        console.log(`[reconnect-wa] ✓ Yeniden bağlantı tetiklendi → ${psych.full_name}`)
      } else {
        // Railway bağlanamıyorsa DB'yi güncelle — dashboard'da kırmızı gösterilsin
        await supabase
          .from('psychologists')
          .update({ is_connected: false })
          .eq('id', psych.id)
        console.log(`[reconnect-wa] ✗ Bağlantı kurulamadı, is_connected=false yapıldı → ${psych.full_name}`)
      }
    }
  }

  return { statusCode: 200 }
})

export { handler }
