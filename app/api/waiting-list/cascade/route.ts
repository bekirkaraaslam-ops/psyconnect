import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DAY_MAP: Record<number, string> = {
  0: 'pazar',
  1: 'pazartesi',
  2: 'salı',
  3: 'çarşamba',
  4: 'perşembe',
  5: 'cuma',
  6: 'cumartesi',
}

// POST — randevu iptali sonrası çağrılır
// body: { psychologist_id, slot_date } (ISO string)
export async function POST(req: NextRequest) {
  const { psychologist_id, slot_date } = await req.json()
  if (!psychologist_id || !slot_date) {
    return NextResponse.json({ error: 'psychologist_id ve slot_date zorunludur.' }, { status: 400 })
  }

  const supabase = getSupabase()
  const slot = new Date(slot_date)
  const slotDay = DAY_MAP[slot.getDay()]
  const slotHour = slot.getHours()

  // Bekleme listesindeki en uygun kişiyi bul
  const { data: candidates } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('psychologist_id', psychologist_id)
    .eq('status', 'waiting')
    .order('created_at')

  if (!candidates?.length) return NextResponse.json({ ok: true, message: 'Bekleme listesi boş.' })

  // Skoring: tercih ettiği gün + saat aralığı eşleşmesi
  const scored = candidates.map(c => {
    const days: string[] = c.preferred_days ?? []
    const dayMatch = days.length === 0 || days.includes(slotDay) ? 2 : 0
    const timeStart: number = c.preferred_time_start ?? 9
    const timeEnd: number = c.preferred_time_end ?? 18
    const timeMatch = (slotHour >= timeStart && slotHour < timeEnd) ? 1 : 0
    return { ...c, score: dayMatch + timeMatch }
  })
  scored.sort((a, b) => b.score - a.score)

  const winner = scored[0]

  // Teklif durumuna güncelle
  await supabase
    .from('waiting_list')
    .update({
      status: 'offered',
      offer_status: 'pending',
      offer_sent_at: new Date().toISOString(),
      offered_slot: slot_date,
    })
    .eq('id', winner.id)

  // Railway'e cascade-offer çağrısı yap
  try {
    await fetch(`${process.env.WA_SERVICE_URL}/cascade-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.WA_API_KEY!,
      },
      body: JSON.stringify({
        waitlistId: winner.id,
        psychologistId: psychologist_id,
        phone: winner.phone_number,
        slotDate: slot_date,
        name: winner.name_surname,
      }),
    })
  } catch {
    // Railway ulaşılamazsa waiting_list kaydı güncellenmiş olduğundan timeout checker devreye girecek
  }

  return NextResponse.json({ ok: true, offeredTo: winner.name_surname })
}
