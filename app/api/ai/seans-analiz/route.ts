import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { decrypt } from '@/lib/crypto'
import { getLimits } from '@/lib/plans'

function safeDecrypt(val: string | null | undefined): string {
  if (!val) return ''
  try { return decrypt(val) } catch { return '' }
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { patient_id } = await req.json()
  if (!patient_id) return NextResponse.json({ error: 'patient_id gerekli' }, { status: 400 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, plan_type')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  // Danışanın bu psikologla ilişkisini kontrol et
  const { data: patient } = await supabase
    .from('patients')
    .select('id, name_surname')
    .eq('id', patient_id)
    .eq('psychologist_id', psych.id)
    .maybeSingle()
  if (!patient) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })

  // Son 5 seans notunu getir
  const { data: notlar } = await supabase
    .from('hasta_notlari')
    .select('seans_tarihi, seans_notu_encrypted, soap_s_encrypted, soap_o_encrypted, soap_a_encrypted, soap_p_encrypted')
    .eq('hasta_id', patient_id)
    .eq('psychologist_id', psych.id)
    .order('seans_tarihi', { ascending: false })
    .limit(5)

  if (!notlar || notlar.length < 3) {
    return NextResponse.json(
      { error: 'İlerleme analizi için en az 3 seans notu gereklidir.' },
      { status: 400 }
    )
  }

  // Toplam not sayısını al (cache key olarak kullanılır)
  const { count: toplamNotSayisi } = await supabase
    .from('hasta_notlari')
    .select('*', { count: 'exact', head: true })
    .eq('hasta_id', patient_id)
    .eq('psychologist_id', psych.id)

  const mevcutSayisi = toplamNotSayisi ?? notlar.length

  // Cache kontrolü: aynı not sayısıyla daha önce üretildiyse direkt dön
  const { data: cachedPatient } = await supabase
    .from('patients')
    .select('ai_seans_analiz, ai_seans_analiz_count')
    .eq('id', patient_id)
    .single()

  if (
    cachedPatient?.ai_seans_analiz &&
    cachedPatient?.ai_seans_analiz_count === mevcutSayisi
  ) {
    return NextResponse.json({ analiz: cachedPatient.ai_seans_analiz, seans_sayisi: notlar.length, cached: true })
  }

  const limits = getLimits(psych.plan_type)
  if (limits.monthlyAiSeansAnaliz !== Infinity) {
    const month = currentMonth()
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('seans_analiz_count')
      .eq('psychologist_id', psych.id)
      .eq('month', month)
      .single()

    const count = usage?.seans_analiz_count ?? 0
    if (count >= limits.monthlyAiSeansAnaliz) {
      return NextResponse.json({
        error: `Bu ay ilerleme analizi limitine ulaştınız (${limits.monthlyAiSeansAnaliz}/${limits.monthlyAiSeansAnaliz}). Sınırsız kullanım için Pro'ya geçin.`,
        limitReached: true,
      }, { status: 429 })
    }

    await supabase
      .from('ai_usage')
      .upsert(
        { psychologist_id: psych.id, month, seans_analiz_count: count + 1 },
        { onConflict: 'psychologist_id,month' }
      )
  }

  // Notları ters sıraya al (eskiden yeniye — kronolojik anlatım için)
  const kronolojik = [...notlar].reverse()

  const seansBloklar = kronolojik.map((n, i) => {
    const tarih = new Date(n.seans_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    const ozet = safeDecrypt(n.seans_notu_encrypted)
    const s = safeDecrypt(n.soap_s_encrypted)
    const o = safeDecrypt(n.soap_o_encrypted)
    const a = safeDecrypt(n.soap_a_encrypted)
    const p = safeDecrypt(n.soap_p_encrypted)
    return `--- Seans ${i + 1} (${tarih}) ---\nÖzet: ${ozet || '(yok)'}\nS: ${s || '(yok)'}\nO: ${o || '(yok)'}\nA: ${a || '(yok)'}\nP: ${p || '(yok)'}`
  }).join('\n\n')

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const prompt = `Sen deneyimli bir klinik psikolog asistanısın. Aşağıda bir danışanın son ${notlar.length} seansına ait notlar kronolojik sırayla verilmiştir. Bu notları analiz ederek psikologun hızla okuyabileceği kısa bir ilerleme özeti hazırla.

${seansBloklar}

Şunlara odaklan:
- Danışanın genel seyri nasıl? İlerleme var mı, duraksama mı?
- Hangi temalar tekrar ediyor?
- Dikkat çeken değişimler veya kırılma noktaları var mı?
- Sonraki seanslarda odaklanılması önerilen alan nedir?

4-6 cümlelik, sade ve profesyonel Türkçe bir özet yaz. Madde işareti veya başlık kullanma. Sadece özet metnini yaz.`

  try {
    const result = await model.generateContent(prompt)
    const analiz = result.response.text().trim()
    if (!analiz) throw new Error('Boş yanıt')

    await supabase
      .from('patients')
      .update({ ai_seans_analiz: analiz, ai_seans_analiz_count: mevcutSayisi })
      .eq('id', patient_id)

    return NextResponse.json({ analiz, seans_sayisi: notlar.length })
  } catch (e) {
    console.error('[ai/seans-analiz] error:', e)
    return NextResponse.json({ error: 'Analiz oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
