import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { decrypt } from '@/lib/crypto'

function safeDecrypt(val: string | null | undefined): string {
  if (!val) return ''
  try { return decrypt(val) } catch { return '' }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { anamnez_id } = await req.json()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: form } = await supabase
    .from('anamnez_forms')
    .select('*')
    .eq('id', anamnez_id)
    .eq('psychologist_id', psych.id)
    .single()

  if (!form || !form.filled_at) {
    return NextResponse.json({ error: 'Form bulunamadı veya henüz doldurulmadı.' }, { status: 404 })
  }

  // Daha önce üretilmişse direkt dön
  if (form.ai_ozet) {
    return NextResponse.json({ ozet: form.ai_ozet })
  }

  const sikayet        = safeDecrypt(form.sikayet_encrypted)
  const sure           = safeDecrypt(form.sure_encrypted)
  const gecmisTedavi   = safeDecrypt(form.gecmis_tedavi_encrypted)
  const ilac           = safeDecrypt(form.ilac_kullanim_encrypted)
  const aile           = safeDecrypt(form.aile_gecmis_encrypted)
  const uyku           = safeDecrypt(form.uyku_durum_encrypted)
  const beslenme       = safeDecrypt(form.beslenme_durum_encrypted)
  const ekNotlar       = safeDecrypt(form.ek_notlar_encrypted)

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const prompt = `Sen deneyimli bir klinik psikolog asistanısın. Aşağıdaki anamnez verilerini inceleyerek psikologun ilk görüşmeden önce okuyacağı kısa ve profesyonel bir özet hazırla.

Anamnez verileri:
- Ana şikayet: ${sikayet || 'Belirtilmemiş'}
- Ne zamandır devam ediyor: ${sure || 'Belirtilmemiş'}
- Önceki psikolojik destek: ${gecmisTedavi || 'Yok'}
- İlaç kullanımı: ${ilac || 'Yok'}
- Aile geçmişi: ${aile || 'Belirtilmemiş'}
- Uyku durumu: ${uyku || 'Belirtilmemiş'}
- Beslenme durumu: ${beslenme || 'Belirtilmemiş'}
- Ek notlar: ${ekNotlar || 'Yok'}

3-5 cümlelik, sade ve profesyonel bir Türkçe özet yaz. Madde işareti veya başlık kullanma. Sadece özet metnini yaz.`

  try {
    const result = await model.generateContent(prompt)
    const ozet = result.response.text().trim()
    if (!ozet) throw new Error('Boş yanıt')

    // Veritabanına kaydet — bir sonraki istekte yeniden üretilmesin
    await supabase
      .from('anamnez_forms')
      .update({ ai_ozet: ozet })
      .eq('id', anamnez_id)

    return NextResponse.json({ ozet })
  } catch (e) {
    console.error('[ai/anamnez-summary] error:', e)
    return NextResponse.json({ error: 'Özet oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
