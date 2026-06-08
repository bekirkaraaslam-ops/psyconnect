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

  const { seans_notu, mevcut_s, mevcut_o, mevcut_a, mevcut_p } = await req.json()

  if (!seans_notu?.trim()) {
    return NextResponse.json({ error: 'Önce Genel Notlar alanını doldurun.' }, { status: 400 })
  }

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, plan_type')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const limits = getLimits(psych.plan_type)

  if (limits.monthlyAiSoap !== Infinity) {
    const month = currentMonth()
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('soap_count')
      .eq('psychologist_id', psych.id)
      .eq('month', month)
      .single()

    const count = usage?.soap_count ?? 0
    if (count >= limits.monthlyAiSoap) {
      return NextResponse.json({
        error: `Bu ay SOAP notu limitine ulaştınız (${limits.monthlyAiSoap}/${limits.monthlyAiSoap}). Sınırsız kullanım için Pro'ya geçin.`,
        limitReached: true,
      }, { status: 429 })
    }

    await supabase
      .from('ai_usage')
      .upsert({ psychologist_id: psych.id, month, soap_count: count + 1 }, { onConflict: 'psychologist_id,month' })
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const mevcutBlok = (mevcut_s || mevcut_o || mevcut_a || mevcut_p)
    ? `\nMevcut SOAP notları (bunları geliştir ve eksikleri tamamla):\nS: ${mevcut_s || '(boş)'}\nO: ${mevcut_o || '(boş)'}\nA: ${mevcut_a || '(boş)'}\nP: ${mevcut_p || '(boş)'}\n`
    : ''

  const prompt = `Sen deneyimli bir klinik psikolog asistanısın. Aşağıdaki seans notunu SOAP formatına dönüştür.

Seans notu:
"${seans_notu}"
${mevcutBlok}
Türkçe, profesyonel klinik dil kullanarak yanıt ver. Yalnızca şu JSON formatında döndür, başka hiçbir şey ekleme:
{
  "s": "Danışanın bu seanstaki anlatımları, hisleri ve subjektif ifadeleri...",
  "o": "Psikologun gözlemlediği objektif bulgular, duygu durumu, davranış, iletişim tarzı...",
  "a": "Klinik değerlendirme, izlenim ve ilerleme değerlendirmesi...",
  "p": "Sonraki seans hedefleri, uygulanacak teknikler ve plan..."
}`

  try {
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON bulunamadı')
    const parsed = JSON.parse(match[0])

    return NextResponse.json({
      s: parsed.s ?? '',
      o: parsed.o ?? '',
      a: parsed.a ?? '',
      p: parsed.p ?? '',
    })
  } catch (e) {
    console.error('[ai/soap-note] parse error:', e)
    return NextResponse.json({ error: 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
