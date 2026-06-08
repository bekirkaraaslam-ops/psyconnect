import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getLimits } from '@/lib/plans'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { response_id } = await req.json()
  if (!response_id) return NextResponse.json({ error: 'response_id gerekli' }, { status: 400 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, plan_type')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  // Ölçek yanıtını getir (sahiplik kontrolü için patient üzerinden join)
  const { data: response } = await supabase
    .from('scale_responses')
    .select(`
      id, total_score, interpretation, filled_at,
      patient:patients!scale_responses_patient_id_fkey(id, psychologist_id),
      scale:scales!scale_responses_scale_id_fkey(name, short_name, description)
    `)
    .eq('id', response_id)
    .maybeSingle()

  if (!response) return NextResponse.json({ error: 'Yanıt bulunamadı' }, { status: 404 })
  if (!response.filled_at || response.total_score === null) {
    return NextResponse.json({ error: 'Ölçek henüz doldurulmadı.' }, { status: 400 })
  }

  const patient = response.patient as { id: string; psychologist_id: string } | null
  if (!patient || patient.psychologist_id !== psych.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const scale = response.scale as { name: string; short_name: string; description: string } | null
  if (!scale) return NextResponse.json({ error: 'Ölçek bilgisi bulunamadı' }, { status: 404 })

  const limits = getLimits(psych.plan_type)
  if (limits.monthlyAiOlcekYorum !== Infinity) {
    const month = currentMonth()
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('olcek_yorum_count')
      .eq('psychologist_id', psych.id)
      .eq('month', month)
      .single()

    const count = usage?.olcek_yorum_count ?? 0
    if (count >= limits.monthlyAiOlcekYorum) {
      return NextResponse.json({
        error: `Bu ay ölçek yorumu limitine ulaştınız (${limits.monthlyAiOlcekYorum}/${limits.monthlyAiOlcekYorum}). Sınırsız kullanım için Pro'ya geçin.`,
        limitReached: true,
      }, { status: 429 })
    }

    await supabase
      .from('ai_usage')
      .upsert(
        { psychologist_id: psych.id, month, olcek_yorum_count: count + 1 },
        { onConflict: 'psychologist_id,month' }
      )
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const prompt = `Sen deneyimli bir klinik psikolog asistanısın. Aşağıdaki psikometrik ölçek sonucuna göre psikolog için kısa bir klinik yorum hazırla.

Ölçek: ${scale.short_name} (${scale.name})
Açıklama: ${scale.description}
Toplam Skor: ${response.total_score}
Standart Yorum: ${response.interpretation ?? 'Belirtilmemiş'}

Bu skoru klinik açıdan yorumla: ne anlama geliyor, psikolog hangi konulara dikkat etmeli ve seansta nasıl bir yaklaşım faydalı olabilir? 3-4 cümle, sade ve profesyonel Türkçe, madde işareti veya başlık olmadan, sadece yorum metnini yaz.`

  try {
    const result = await model.generateContent(prompt)
    const yorum = result.response.text().trim()
    if (!yorum) throw new Error('Boş yanıt')
    return NextResponse.json({ yorum })
  } catch (e) {
    console.error('[ai/olcek-yorum] error:', e)
    return NextResponse.json({ error: 'Yorum oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
