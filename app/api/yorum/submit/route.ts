import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { token, yildiz, yorum_metni, isimsiz } = await req.json()

  if (!token || !yildiz || yildiz < 1 || yildiz > 5) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: yorum } = await supabase
    .from('psikolog_yorumlar')
    .select('id, dolduruldu_at, reviewer_init')
    .eq('token', token)
    .single()

  if (!yorum) return NextResponse.json({ error: 'Geçersiz link.' }, { status: 404 })
  if (yorum.dolduruldu_at) return NextResponse.json({ error: 'Bu form zaten dolduruldu.' }, { status: 409 })

  const { error } = await supabase
    .from('psikolog_yorumlar')
    .update({
      yildiz,
      yorum_metni: yorum_metni ?? null,
      reviewer_init: isimsiz ? null : yorum.reviewer_init,
      dolduruldu_at: new Date().toISOString(),
    })
    .eq('id', yorum.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
