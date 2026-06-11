import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAktifPaket, incrementPaket } from '@/lib/paket'
import { normalizePhone } from '@/lib/utils'
import { GoogleGenerativeAI } from '@google/generative-ai'

function isRealTurkishPhone(phone: string): boolean {
  return /^905[0-9]{9}$/.test(phone)
}



const KRIZ_KEYWORDS = ['intihar', 'kendimi öldür', 'kendime zarar', 'hayatıma son', 'yaşamak istemiyorum', 'ölmek istiyorum', 'öldürmek istiyorum kendimi']
const KRIZ_MESAJ = 'Şu an çok zor bir şey yaşıyor olabilirsiniz. Lütfen hemen yardım alın:\n\n🆘 *182* — ALO Psikiyatri Hattı (7/24, ücretsiz)\n🚨 *112* — Acil Servis\n\nRandevu almak ister misiniz? *randevu* yazabilirsiniz.'

async function getGeminiResponse(
  message: string,
  psych: {
    full_name: string
    uzmanlik_alani?: string | null
    work_start_hour: number
    work_end_hour: number
    work_days: string[]
    harita_linki?: string | null
    online_gorusme_linki?: string | null
    tatil_modu: boolean
  },
  packages: { name: string; session_count: number; price_tl: number }[]
): Promise<string> {
  const t = message.toLowerCase()
  if (KRIZ_KEYWORDS.some(k => t.includes(k))) return '__KRIZ__'

  const hasKey = !!process.env.GEMINI_API_KEY
  console.log(`[gemini] key=${hasKey} msg="${message.slice(0, 40)}"`)

  const saatler = `${String(psych.work_start_hour).padStart(2, '0')}:00 - ${String(psych.work_end_hour).padStart(2, '0')}:00`
  const gunler = psych.work_days.join(', ')
  const paketlerText = packages.length > 0
    ? packages.map(p => `- ${p.name}: ${p.session_count} seans, ₺${Number(p.price_tl).toLocaleString('tr-TR')}`).join('\n')
    : 'Tanımlanmış paket yok.'
  const seansturleri = [
    psych.harita_linki ? `Yüz yüze (harita: ${psych.harita_linki})` : 'Yüz yüze',
    psych.online_gorusme_linki ? `Online (link: ${psych.online_gorusme_linki})` : 'Online',
  ].join(', ')

  const systemPrompt = `Sen ${psych.full_name} kliniğinin WhatsApp randevu asistanısın. Danışanlarla kısa, samimi ve ölçülü bir dille iletişim kuruyorsun.

KİMLİK KURALI: Hiçbir zaman "yapay zeka", "AI", "bot" gibi şeyler söyleme. Sorulursa: "Kliniğin randevu hattıyım."

TON KURALI: Samimi ama ölçülü. Kısa cümleler. Terapötik dil YASAK — "çok zor olmalı", "yalnız değilsiniz", "güçlüsünüz" gibi ifadeler kullanma.

MUTLAK YASAKLAR:
- Psikolojik tavsiye, yorum veya yönlendirme verme
- Tanı koy, semptom yorumla
- İlaç veya tedavi öner
- Psikolog hakkında kişisel yorum yap
- Başka kliniklerle karşılaştırma yap
- Danışan bilgilerini paylaş
- Siyasi, dini veya hukuki içerik
- Fiyat pazarlığı veya indirim vaat et

KRİZ PROTOKOLÜ (EN YÜKSEK ÖNCELİK): İntihar, kendine zarar verme veya ölmek isteme içeren mesajlarda sadece şunu döndür: __KRIZ__

YANIT VEREBİLECEĞİN KONULAR:
- Randevu talebi → __RANDEVU_AL__
- Randevu iptali → __RANDEVU_IPTAL__
- Randevu onayı → __RANDEVU_ONAYLA__
- Çalışma günleri: ${gunler}
- Çalışma saatleri: ${saatler}
- Seans türleri: ${seansturleri}
- Uzmanlık alanı: ${psych.uzmanlik_alani ?? 'Belirtilmemiş'}
- Paket fiyatları (sadece bunlar, başka fiyat söyleme):
${paketlerText}

SELAMLAMA VE GENEL KONUŞMA: "Merhaba", "iyi günler", "nasılsınız" gibi mesajlara kısa ve samimi karşılık ver. Örnek: "Merhaba! Size nasıl yardımcı olabilirim?" Kesinlikle komut listesi, menü veya "randevu için randevu yazın" tarzı talimat ekleme.

BİLİNMEYEN SORULARA: "Bu konuda size bilgi veremiyorum. Daha fazlası için kliniğimizle doğrudan iletişime geçebilirsiniz."

ÇIKTI FORMATI: Sinyal sinyalleri (__RANDEVU_AL__ vb.) dışında sadece düz Türkçe metin yaz — markdown, başlık veya liste kullanma. Asla komut listesi veya menü gösterme.

DANIŞAN MESAJI: "${message}"`

  const SIGNALS = ['__RANDEVU_AL__', '__RANDEVU_IPTAL__', '__RANDEVU_ONAYLA__', '__KRIZ__']

  const callGemini = async (): Promise<string> => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await Promise.race([
      model.generateContent(systemPrompt),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ])
    const raw = (result as Awaited<ReturnType<typeof model.generateContent>>).response.text().trim()
    console.log(`[gemini] raw="${raw.slice(0, 80)}"`)
    if (SIGNALS.includes(raw)) return raw
    return raw || ''
  }

  try {
    return await callGemini()
  } catch (err: any) {
    const msg: string = err?.message ?? String(err)
    console.error('[gemini] hata (1. deneme):', msg)
    if (msg.includes('503') || msg.includes('overload') || msg.includes('yüksek talep') || msg.includes('quota')) {
      await new Promise(r => setTimeout(r, 2000))
      try {
        return await callGemini()
      } catch (err2: any) {
        console.error('[gemini] hata (2. deneme):', err2?.message ?? err2)
        return ''
      }
    }
    return ''
  }
}

async function handleRandevuAl(
  supabase: ReturnType<typeof getSupabase>,
  psychologistId: string,
  phone: string,
  psych: { tatil_modu: boolean; work_days: string[]; work_start_hour: number; work_end_hour: number; booking_slug: string | null },
  workDays: string[],
  workStart: number,
  workEnd: number,
) {
  if (psych.tatil_modu) {
    await sendReply(psychologistId, phone,
      'Merhaba! Psikologumuz şu an izinde olduğundan yeni randevu talebi alınamamaktadır. Kısa süre içinde tekrar deneyebilirsiniz.'
    )
    return
  }
  const days = getAvailableDays(workDays)
  if (days.length === 0) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seansify.com'
    const waitSlug = psych.booking_slug ?? psychologistId
    await sendReply(psychologistId, phone, `Şu an müsait randevu günü bulunmamaktadır.\n\nBekleme listesine eklenip boşalan randevulardan haberdar olmak ister misiniz? 👇\n${appUrl}/bekle/${waitSlug}`)
    return
  }
  const list = days.map((d, i) => `${i + 1}️⃣ ${d.label}`).join('\n')
  await setSession(supabase, phone, psychologistId, 'awaiting_day', { available_days: days })
  await sendReply(psychologistId, phone, `📅 Müsait günler:\n\n${list}\n\nTercih ettiğiniz günün numarasını yazın.`)
}

async function handleRandevuIptal(
  supabase: ReturnType<typeof getSupabase>,
  psychologistId: string,
  phone: string,
) {
  const { data: patient } = await supabase
    .from('patients').select('id').eq('phone_number', phone)
    .eq('psychologist_id', psychologistId).eq('is_active', true).maybeSingle()

  if (!patient) {
    await sendReply(psychologistId, phone, 'İptal edilecek aktif bir randevunuz bulunamadı.')
    return
  }

  const { data: apts } = await supabase.from('appointments')
    .select('id, appointment_date')
    .eq('patient_id', patient.id)
    .in('status', ['waiting', 'confirmed', 'seansify_pending'])
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })

  if (!apts || apts.length === 0) {
    await sendReply(psychologistId, phone, 'İptal edilecek aktif bir randevunuz bulunamadı.')
    return
  }

  const fmtApt = (a: { id: string; appointment_date: string }) => {
    const d = new Date(a.appointment_date)
    const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'Europe/Istanbul' })
    const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
    return `${dateStr} — ${timeStr}`
  }

  if (apts.length === 1) {
    const label = fmtApt(apts[0])
    await setSession(supabase, phone, psychologistId, 'awaiting_cancel_confirm', {
      appointment_id: apts[0].id,
      appointment_label: label,
    })
    await sendReply(psychologistId, phone,
      `❗ *${label}* randevunuzu iptal etmek istediğinize emin misiniz?\n\n*evet* — İptal et\n*hayır* — Vazgeç`
    )
    return
  }

  const items = apts.map(a => ({ id: a.id, label: fmtApt(a) }))
  const list = items.map((a, i) => `${i + 1}️⃣ ${a.label}`).join('\n')
  await setSession(supabase, phone, psychologistId, 'awaiting_cancel_selection', { appointments: items })
  await sendReply(psychologistId, phone, `Hangi randevunuzu iptal etmek istiyorsunuz?\n\n${list}`)
}

async function doCancelAppointment(
  supabase: ReturnType<typeof getSupabase>,
  psychologistId: string,
  phone: string,
  aptId: string,
  aptLabel: string,
) {
  await supabase.from('appointments').update({ status: 'cancelled_by_patient' }).eq('id', aptId)
  const { data: apt } = await supabase.from('appointments').select('patient_id').eq('id', aptId).maybeSingle()
  if (apt) {
    const { data: p } = await supabase.from('patients').select('cancel_count').eq('id', apt.patient_id).maybeSingle()
    await supabase.from('patients').update({ cancel_count: (p?.cancel_count ?? 0) + 1 }).eq('id', apt.patient_id)
  }
  await setSession(supabase, phone, psychologistId, 'idle', {})
  await sendReply(psychologistId, phone,
    `❌ *${aptLabel}* randevunuz iptal edildi.\n\nYeni randevu almak için *randevu* yazabilirsiniz.`
  )
}

async function handleRandevuOnayla(
  supabase: ReturnType<typeof getSupabase>,
  psychologistId: string,
  phone: string,
) {
  const { data: patient } = await supabase
    .from('patients').select('id, name_surname').eq('phone_number', phone)
    .eq('psychologist_id', psychologistId).eq('is_active', true).maybeSingle()
  if (patient) {
    const { data: apt } = await supabase.from('appointments').select('id, appointment_date')
      .eq('patient_id', patient.id).in('status', ['waiting', 'seansify_pending', 'confirmed'])
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true }).limit(1).maybeSingle()
    if (apt) {
      await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', apt.id)
      const d = new Date(apt.appointment_date)
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
      const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      await sendReply(psychologistId, phone, `✅ Randevunuz onaylandı!\n\n📅 ${dateStr} — ${timeStr}\n\nGörüşmek üzere!`)
      return
    }
  }
  await sendReply(psychologistId, phone, 'Onaylanacak aktif bir randevunuz bulunamadı.')
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

let _replyJid: string | undefined

async function sendReply(psychologistId: string, phone: string, message: string, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${process.env.WA_SERVICE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.WA_API_KEY! },
        body: JSON.stringify({ psychologistId, phone, message, replyJid: _replyJid }),
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) return
      console.warn(`[sendReply] attempt ${attempt + 1} failed: HTTP ${res.status}`)
    } catch (e) {
      console.warn(`[sendReply] attempt ${attempt + 1} error:`, e)
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
  }
  console.error(`[sendReply] all ${retries + 1} attempts failed for ${phone}`)
}

const DAY_JS: Record<string, number> = {
  pazar: 0, pazartesi: 1, 'salı': 2, 'çarşamba': 3, 'perşembe': 4, cuma: 5, cumartesi: 6,
}
const DAY_LABEL: Record<number, string> = {
  0: 'Pazar', 1: 'Pazartesi', 2: 'Salı', 3: 'Çarşamba', 4: 'Perşembe', 5: 'Cuma', 6: 'Cumartesi',
}
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']

function getAvailableDays(workDays: string[]): { label: string; iso: string }[] {
  const allowed = new Set(workDays.map(d => DAY_JS[d]).filter(n => n !== undefined))
  const result: { label: string; iso: string }[] = []
  const todayTR = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }))
  todayTR.setHours(0, 0, 0, 0)
  for (let i = 1; i <= 14 && result.length < 5; i++) {
    const d = new Date(todayTR)
    d.setDate(todayTR.getDate() + i)
    if (allowed.has(d.getDay())) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      result.push({ label: `${DAY_LABEL[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`, iso })
    }
  }
  return result
}

async function getAvailableSlots(
  supabase: ReturnType<typeof getSupabase>,
  psychologistId: string,
  dayIso: string,
  workStartHour: number,
  workEndHour: number
): Promise<string[]> {
  const { data: booked } = await supabase
    .from('appointments')
    .select('appointment_date')
    .eq('psychologist_id', psychologistId)
    .gte('appointment_date', `${dayIso}T00:00:00+03:00`)
    .lte('appointment_date', `${dayIso}T23:59:59+03:00`)
    .not('status', 'in', '("canceled","cancelled_by_patient")')

  const bookedHours = new Set((booked ?? []).map((a: { appointment_date: string }) => {
    const d = new Date(a.appointment_date)
    return (d.getUTCHours() + 3) % 24
  }))
  const slots: string[] = []
  for (let h = workStartHour; h < workEndHour; h++) {
    if (!bookedHours.has(h)) slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

async function getSession(supabase: ReturnType<typeof getSupabase>, phone: string, psychologistId: string) {
  const { data, error } = await supabase
    .from('wa_bot_sessions')
    .select('step, context, updated_at')
    .eq('phone_number', phone)
    .eq('psychologist_id', psychologistId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) console.error('[session] getSession hata:', error.message)
  if (!data) return { step: 'idle', context: {} }
  // 20 dakikadan eski non-idle session → sıfırla
  if (data.step !== 'idle' && data.updated_at) {
    const ageMs = Date.now() - new Date(data.updated_at).getTime()
    if (ageMs > 20 * 60 * 1000) {
      console.log(`[session] timeout — phone=${phone} step=${data.step}, idle'a döndürüldü`)
      return { step: 'idle', context: {} }
    }
  }
  return { step: data.step, context: data.context }
}

async function setSession(
  supabase: ReturnType<typeof getSupabase>,
  phone: string,
  psychologistId: string,
  step: string,
  context: object
) {
  const now = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('wa_bot_sessions')
    .update({ step, context, updated_at: now })
    .eq('phone_number', phone)
    .eq('psychologist_id', psychologistId)
    .select('id')

  if (updateError) {
    console.error(`[session] update hata (phone=${phone} step=${step}):`, updateError.message)
    return
  }

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from('wa_bot_sessions')
      .insert({ phone_number: phone, psychologist_id: psychologistId, step, context, updated_at: now })
    if (insertError) console.error(`[session] insert hata (phone=${phone} step=${step}):`, insertError.message)
    else console.log(`[session] inserted phone=${phone} step=${step}`)
    return
  }

  console.log(`[session] updated phone=${phone} step=${step}`)
}

const TATIL_MESAJ = 'Merhaba! Psikologumuz şu an izinde olduğundan yeni randevu talebi alınamamaktadır. Kısa süre içinde tekrar deneyebilirsiniz.'

async function tryAnswerMidFlow(
  supabase: ReturnType<typeof getSupabase>,
  psychologistId: string,
  phone: string,
  text: string,
  psych: Parameters<typeof getGeminiResponse>[1],
  stepReminder: string,
): Promise<'handled' | 'restart' | 'passthrough'> {
  const { data: paketler } = await supabase
    .from('paket_sablonlari')
    .select('name, session_count, price_tl')
    .eq('psychologist_id', psychologistId)
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at')

  const response = await getGeminiResponse(text, psych, paketler ?? [])

  if (response === '__KRIZ__') {
    await sendReply(psychologistId, phone, KRIZ_MESAJ)
    return 'handled'
  }
  // Yeni randevu niyeti — session'ı sıfırla, akışı yeniden başlat
  if (response === '__RANDEVU_AL__') {
    await setSession(supabase, phone, psychologistId, 'idle', {})
    return 'restart'
  }
  // Diğer sinyaller — adımda kal
  if (response.startsWith('__')) return 'passthrough'

  if (response) {
    await sendReply(psychologistId, phone, `${response}\n\n_(${stepReminder})_`)
    return 'handled'
  }
  return 'passthrough'
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.WA_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { psychologistId, phone: rawPhone, message, replyJid } = await req.json()
  if (!psychologistId || !rawPhone || !message) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }
  _replyJid = replyJid

  const supabase = getSupabase()
  const lidPhone = normalizePhone(rawPhone)
  const text = String(message).trim()
  const textLower = text.toLowerCase().replace('i̇', 'i')

  const { data: psych } = await supabase
    .from('psychologists')
    .select('full_name, work_days, work_start_hour, work_end_hour, is_connected, booking_slug, tatil_modu, uzmanlik_alani, harita_linki, online_gorusme_linki')
    .eq('id', psychologistId)
    .single()

  if (!psych?.is_connected) return NextResponse.json({ ok: true })

  const workDays: string[] = psych.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma']
  const workStart: number = psych.work_start_hour ?? 9
  const workEnd: number = psych.work_end_hour ?? 18

  // @lid JID çözümü: replyJid ile kayıtlı hasta varsa gerçek telefon numarasını kullan.
  // @lid'den çıkan numara gerçek telefon değil — bu lookup olmadan duplicate hasta oluşur.
  let phone = lidPhone
  if (replyJid) {
    const { data: jidPatient } = await supabase
      .from('patients')
      .select('phone_number')
      .eq('psychologist_id', psychologistId)
      .eq('whatsapp_jid', replyJid)
      .maybeSingle()
    if (jidPatient) {
      phone = jidPatient.phone_number
      console.log(`[jid-resolve] ${lidPhone} → ${phone} (whatsapp_jid eşleşti)`)
    } else {
      // İlk kez gelen @lid — gerçek telefon numarası ile kayıtlı hasta var mı bak
      const { data: phonePatient } = await supabase
        .from('patients')
        .select('id')
        .eq('psychologist_id', psychologistId)
        .eq('phone_number', lidPhone)
        .maybeSingle()
      if (phonePatient && replyJid) {
        await supabase.from('patients').update({ whatsapp_jid: replyJid }).eq('id', phonePatient.id)
        console.log(`[jid-map] ${lidPhone} → jid kaydedildi`)
      }
    }
  }

  // JID'i hasta kaydında güncelle (canonical phone ile)
  if (replyJid) {
    await supabase
      .from('patients')
      .update({ whatsapp_jid: replyJid })
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
  }

  console.log(`[incoming] phone=${phone} replyJid=${replyJid ?? 'none'} msg="${text.slice(0, 50)}"`)

  // Session fetched early so keyword handlers can use step context
  const session = await getSession(supabase, phone, psychologistId)
  const { step, context } = session as { step: string; context: Record<string, unknown> }

  // ── RANDEVU keyword — her state'de çalışır, session'ı sıfırlar ──────────────
  if (textLower === 'randevu') {
    await setSession(supabase, phone, psychologistId, 'idle', {})
    await handleRandevuAl(supabase, psychologistId, phone, psych, workDays, workStart, workEnd)
    return NextResponse.json({ ok: true })
  }

  // ── EVET / ONAYLA — cancel confirm veya randevu onaylama ───────────────────
  if (textLower === 'evet' || textLower === 'onayla') {
    if (step === 'awaiting_cancel_confirm') {
      await doCancelAppointment(supabase, psychologistId, phone, context.appointment_id as string, context.appointment_label as string)
    } else {
      await handleRandevuOnayla(supabase, psychologistId, phone)
    }
    return NextResponse.json({ ok: true })
  }

  // ── HAYIR — iptal akışından çık ────────────────────────────────────────────
  if (textLower === 'hayır' || textLower === 'hayir') {
    if (step === 'awaiting_cancel_confirm' || step === 'awaiting_cancel_selection') {
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone, 'Anlaşıldı, randevu iptal isteğiniz iptal edildi.')
    }
    return NextResponse.json({ ok: true })
  }

  // ── KRİZ — her adımda çalışır ────────────────────────────────────────────
  if (KRIZ_KEYWORDS.some(k => textLower.includes(k))) {
    await sendReply(psychologistId, phone, KRIZ_MESAJ)
    return NextResponse.json({ ok: true })
  }

  // ── İPTAL keyword ───────────────────────────────────────────────────────────
  if (textLower === 'iptal') {
    await handleRandevuIptal(supabase, psychologistId, phone)
    return NextResponse.json({ ok: true })
  }

  // ── STATE MACHINE ────────────────────────────────────────────────────────────

  if (step === 'idle') {
    const { data: paketler } = await supabase
      .from('paket_sablonlari')
      .select('name, session_count, price_tl')
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at')

    const geminiResponse = await getGeminiResponse(text, psych, paketler ?? [])

    if (geminiResponse === '__KRIZ__') {
      await sendReply(psychologistId, phone, KRIZ_MESAJ)
      return NextResponse.json({ ok: true })
    }
    if (geminiResponse === '__RANDEVU_AL__') {
      await handleRandevuAl(supabase, psychologistId, phone, psych, workDays, workStart, workEnd)
      return NextResponse.json({ ok: true })
    }
    if (geminiResponse === '__RANDEVU_IPTAL__') {
      await handleRandevuIptal(supabase, psychologistId, phone)
      return NextResponse.json({ ok: true })
    }
    if (geminiResponse === '__RANDEVU_ONAYLA__') {
      await handleRandevuOnayla(supabase, psychologistId, phone)
      return NextResponse.json({ ok: true })
    }
    if (geminiResponse) {
      await sendReply(psychologistId, phone, geminiResponse)
      return NextResponse.json({ ok: true })
    }

    // Gemini timeout/hata — fallback
    await sendReply(psychologistId, phone, `Şu an yoğunluk nedeniyle yanıt veremiyorum, lütfen birkaç saniye sonra tekrar deneyin.`)
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_cancel_selection') {
    const appointments = (context.appointments ?? []) as { id: string; label: string }[]
    const n = parseInt(text)
    if (isNaN(n) || n < 1 || n > appointments.length) {
      const list = appointments.map((a, i) => `${i + 1}️⃣ ${a.label}`).join('\n')
      await sendReply(psychologistId, phone, `Lütfen 1-${appointments.length} arası bir numara girin:\n\n${list}`)
      return NextResponse.json({ ok: true })
    }
    const selected = appointments[n - 1]
    await setSession(supabase, phone, psychologistId, 'awaiting_cancel_confirm', {
      appointment_id: selected.id,
      appointment_label: selected.label,
    })
    await sendReply(psychologistId, phone,
      `❗ *${selected.label}* randevunuzu iptal etmek istediğinize emin misiniz?\n\n*evet* — İptal et\n*hayır* — Vazgeç`
    )
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_day') {
    if (psych.tatil_modu) {
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone, TATIL_MESAJ)
      return NextResponse.json({ ok: true })
    }
    const days = (context.available_days ?? []) as { label: string; iso: string }[]
    const n = parseInt(text)
    if (isNaN(n) || n < 1 || n > days.length) {
      const list = days.map((d, i) => `${i + 1}️⃣ ${d.label}`).join('\n')
      const midResult = await tryAnswerMidFlow(supabase, psychologistId, phone, text, psych, `Randevu günü seçimi için 1-${days.length} arası numara yazabilirsiniz`)
      if (midResult === 'restart') await handleRandevuAl(supabase, psychologistId, phone, psych, workDays, workStart, workEnd)
      else if (midResult === 'passthrough') await sendReply(psychologistId, phone, `Lütfen 1-${days.length} arası bir numara girin:\n\n${list}`)
      return NextResponse.json({ ok: true })
    }
    const selected = days[n - 1]
    const slots = await getAvailableSlots(supabase, psychologistId, selected.iso, workStart, workEnd)
    if (slots.length === 0) {
      const list = days.map((d, i) => `${i + 1}️⃣ ${d.label}`).join('\n')
      await sendReply(psychologistId, phone, `${selected.label} için müsait saat kalmamış. Başka bir gün seçin:\n\n${list}`)
      return NextResponse.json({ ok: true })
    }
    const slotList = slots.map((s, i) => `${i + 1}️⃣ ${s}`).join('\n')
    await setSession(supabase, phone, psychologistId, 'awaiting_time', {
      day_iso: selected.iso,
      day_label: selected.label,
      available_times: slots,
    })
    await sendReply(psychologistId, phone, `🕐 *${selected.label}* için müsait saatler:\n\n${slotList}\n\nTercih ettiğiniz saatin numarasını yazın.`)
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_time') {
    if (psych.tatil_modu) {
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone, TATIL_MESAJ)
      return NextResponse.json({ ok: true })
    }
    const times = (context.available_times ?? []) as string[]
    const n = parseInt(text)
    if (isNaN(n) || n < 1 || n > times.length) {
      const slotList = times.map((s, i) => `${i + 1}️⃣ ${s}`).join('\n')
      const midResult = await tryAnswerMidFlow(supabase, psychologistId, phone, text, psych, `Saat seçimi için 1-${times.length} arası numara yazabilirsiniz`)
      if (midResult === 'restart') await handleRandevuAl(supabase, psychologistId, phone, psych, workDays, workStart, workEnd)
      else if (midResult === 'passthrough') await sendReply(psychologistId, phone, `Lütfen 1-${times.length} arası bir numara girin:\n\n${slotList}`)
      return NextResponse.json({ ok: true })
    }
    const selectedTime = times[n - 1]
    const aptIso = new Date(`${context.day_iso}T${selectedTime}:00+03:00`).toISOString()
    const aptLabel = `${context.day_label} — ${selectedTime}`

    await setSession(supabase, phone, psychologistId, 'awaiting_appointment_type', {
      appointment_iso: aptIso,
      appointment_label: aptLabel,
    })
    await sendReply(psychologistId, phone, `Seansınız nasıl gerçekleşecek?\n\n1️⃣ Yüz yüze\n2️⃣ Online`)
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_appointment_type') {
    if (psych.tatil_modu) {
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone, TATIL_MESAJ)
      return NextResponse.json({ ok: true })
    }
    const n = parseInt(text)
    if (n !== 1 && n !== 2) {
      const midResult = await tryAnswerMidFlow(supabase, psychologistId, phone, text, psych, 'Seans türü için *1* (Yüz yüze) veya *2* (Online) yazabilirsiniz')
      if (midResult === 'restart') await handleRandevuAl(supabase, psychologistId, phone, psych, workDays, workStart, workEnd)
      else if (midResult === 'passthrough') await sendReply(psychologistId, phone, 'Lütfen *1* (Yüz yüze) veya *2* (Online) yazın.')
      return NextResponse.json({ ok: true })
    }
    const appointmentType = n === 1 ? 'yuzyuze' : 'online'
    const aptIso = context.appointment_iso as string
    const aptLabel = context.appointment_label as string

    const { data: paketler } = await supabase
      .from('paket_sablonlari')
      .select('id, name, session_count, price_tl')
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at')

    if (paketler && paketler.length > 0) {
      const list = paketler.map((p: { id: string; name: string; session_count: number; price_tl: number }, i: number) => {
        const perSeans = Math.round(p.price_tl / p.session_count)
        return `${i + 1}️⃣ ${p.name} — ${p.session_count} seans, ₺${Number(p.price_tl).toLocaleString('tr-TR')} (₺${perSeans}/seans)`
      }).join('\n')
      const tekSeansNum = paketler.length + 1
      await setSession(supabase, phone, psychologistId, 'awaiting_package', {
        appointment_iso: aptIso,
        appointment_label: aptLabel,
        appointment_type: appointmentType,
        paket_sablonlari: paketler,
      })
      await sendReply(psychologistId, phone,
        `📦 Seans paketi seçmek ister misiniz?\n\n${list}\n${tekSeansNum}️⃣ Tek Seans\n\nNumarasını yazın.`
      )
      return NextResponse.json({ ok: true })
    }

    // Paket yok — doğrudan randevu oluştur
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name_surname')
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .maybeSingle()

    if (patient) {
      const pkg = await getAktifPaket(supabase, patient.id)
      const ucretPaketsiz = pkg?.birim_fiyat ?? null
      await supabase.from('appointments').insert({
        psychologist_id: psychologistId,
        patient_id: patient.id,
        appointment_date: aptIso,
        duration_minutes: 50,
        status: 'seansify_pending',
        appointment_type: appointmentType,
        ucret: ucretPaketsiz,
        odeme_durumu: ucretPaketsiz != null ? 'bekliyor' : null,
      })
      if (pkg) await incrementPaket(supabase, patient.id)
      await setSession(supabase, phone, psychologistId, 'idle', {})
      const typeLabel = appointmentType === 'online' ? '💻 Online' : '🏢 Yüz yüze'
      await sendReply(psychologistId, phone,
        `✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 ${(patient as { id: string; name_surname: string }).name_surname}\n📅 ${aptLabel}\n${typeLabel}\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.`
      )
    } else {
      await setSession(supabase, phone, psychologistId, 'awaiting_name', {
        appointment_iso: aptIso,
        appointment_label: aptLabel,
        appointment_type: appointmentType,
        selected_paket: null,
      })
      await sendReply(psychologistId, phone, `Son olarak adınızı ve soyadınızı yazar mısınız?`)
    }
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_package') {
    if (psych.tatil_modu) {
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone, TATIL_MESAJ)
      return NextResponse.json({ ok: true })
    }
    const paketler = (context.paket_sablonlari ?? []) as { id: string; name: string; session_count: number; price_tl: number }[]
    const appointmentType = (context.appointment_type as string) ?? 'yuzyuze'
    const tekSeansNum = paketler.length + 1
    const n = parseInt(text)

    if (isNaN(n) || n < 1 || n > tekSeansNum) {
      const list = paketler.map((p, i) => {
        const perSeans = Math.round(p.price_tl / p.session_count)
        return `${i + 1}️⃣ ${p.name} — ${p.session_count} seans, ₺${Number(p.price_tl).toLocaleString('tr-TR')} (₺${perSeans}/seans)`
      }).join('\n')
      const midResult = await tryAnswerMidFlow(supabase, psychologistId, phone, text, psych, `Paket seçimi için 1-${tekSeansNum} arası numara yazabilirsiniz`)
      if (midResult === 'restart') await handleRandevuAl(supabase, psychologistId, phone, psych, workDays, workStart, workEnd)
      else if (midResult === 'passthrough') await sendReply(psychologistId, phone,
        `Lütfen 1-${tekSeansNum} arası bir numara girin:\n\n${list}\n${tekSeansNum}️⃣ Tek Seans`
      )
      return NextResponse.json({ ok: true })
    }

    const selectedPaket = n < tekSeansNum ? paketler[n - 1] : null

    const { data: patient } = await supabase
      .from('patients')
      .select('id, name_surname')
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .maybeSingle()

    const aptIso = context.appointment_iso as string
    const aptLabel = context.appointment_label as string

    if (patient) {
      let ucret: number | null = null
      let toplam_paket_seansi: number | null = null

      if (selectedPaket) {
        ucret = Math.round(selectedPaket.price_tl / selectedPaket.session_count)
        toplam_paket_seansi = selectedPaket.session_count
        await supabase.from('seans_paketleri').insert({
          patient_id: patient.id,
          birim_fiyat: ucret,
          toplam_seans: selectedPaket.session_count,
          kullanilan_seans: 1,
          aktif: selectedPaket.session_count > 1,
        })
      } else {
        const pkg = await getAktifPaket(supabase, patient.id)
        ucret = pkg?.birim_fiyat ?? null
        if (pkg) await incrementPaket(supabase, patient.id)
      }

      await supabase.from('appointments').insert({
        psychologist_id: psychologistId,
        patient_id: patient.id,
        appointment_date: aptIso,
        duration_minutes: 50,
        status: 'seansify_pending',
        appointment_type: appointmentType,
        ucret,
        odeme_durumu: 'bekliyor',
        toplam_paket_seansi,
        mevcut_seans_no: toplam_paket_seansi != null ? 1 : null,
      })
      await setSession(supabase, phone, psychologistId, 'idle', {})
      const paketBilgi = selectedPaket ? `\n📦 ${selectedPaket.name}` : ''
      const typeLabel = appointmentType === 'online' ? '\n💻 Online' : '\n🏢 Yüz yüze'
      await sendReply(psychologistId, phone,
        `✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 ${(patient as { id: string; name_surname: string }).name_surname}\n📅 ${aptLabel}${typeLabel}${paketBilgi}\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.`
      )
    } else {
      await setSession(supabase, phone, psychologistId, 'awaiting_name', {
        appointment_iso: aptIso,
        appointment_label: aptLabel,
        appointment_type: appointmentType,
        selected_paket: selectedPaket,
      })
      await sendReply(psychologistId, phone, `Son olarak adınızı ve soyadınızı yazar mısınız?`)
    }
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_name') {
    if (psych.tatil_modu) {
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone, TATIL_MESAJ)
      return NextResponse.json({ ok: true })
    }
    if (text.length < 3 || !text.includes(' ')) {
      await sendReply(psychologistId, phone, 'Lütfen adınızı ve soyadınızı tam olarak yazın. Örnek: *Ahmet Yılmaz*')
      return NextResponse.json({ ok: true })
    }

    const appointmentType = (context.appointment_type as string) ?? 'yuzyuze'

    // @lid kullanıcısında telefon gerçek değil — gerçek numarayı sor
    if (!isRealTurkishPhone(phone)) {
      await setSession(supabase, phone, psychologistId, 'awaiting_real_phone', {
        appointment_iso: context.appointment_iso,
        appointment_label: context.appointment_label,
        appointment_type: appointmentType,
        selected_paket: context.selected_paket ?? null,
        name_surname: text,
      })
      await sendReply(psychologistId, phone,
        `Son olarak telefon numaranızı paylaşır mısınız?\n\nÖrnek: *0532 XXX XX XX*`
      )
      return NextResponse.json({ ok: true })
    }

    // Önce mevcut hasta var mı kontrol et (duplicate key önleme)
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
      .maybeSingle()

    let patientId: string
    if (existingPatient) {
      await supabase.from('patients').update({ name_surname: text, is_active: true, whatsapp_jid: replyJid ?? null }).eq('id', existingPatient.id)
      patientId = existingPatient.id
    } else {
      const { data: newPatient } = await supabase
        .from('patients')
        .insert({ psychologist_id: psychologistId, name_surname: text, phone_number: phone, is_active: true, whatsapp_jid: replyJid ?? null })
        .select()
        .single()

      if (!newPatient) {
        await sendReply(psychologistId, phone, 'Bir hata oluştu. Lütfen tekrar deneyin.')
        return NextResponse.json({ ok: true })
      }
      patientId = newPatient.id
    }

    const selectedPaket = (context.selected_paket ?? null) as { name: string; session_count: number; price_tl: number } | null
    let ucret: number | null = null
    let toplam_paket_seansi: number | null = null

    if (selectedPaket) {
      ucret = Math.round(selectedPaket.price_tl / selectedPaket.session_count)
      toplam_paket_seansi = selectedPaket.session_count
      await supabase.from('seans_paketleri').insert({
        patient_id: patientId,
        birim_fiyat: ucret,
        toplam_seans: selectedPaket.session_count,
        kullanilan_seans: 1,
        aktif: selectedPaket.session_count > 1,
      })
    }

    await supabase.from('appointments').insert({
      psychologist_id: psychologistId,
      patient_id: patientId,
      appointment_date: context.appointment_iso,
      duration_minutes: 50,
      status: 'seansify_pending',
      appointment_type: appointmentType,
      ucret,
      odeme_durumu: ucret != null ? 'bekliyor' : null,
      toplam_paket_seansi,
      mevcut_seans_no: toplam_paket_seansi != null ? 1 : null,
    })
    await setSession(supabase, phone, psychologistId, 'idle', {})
    const paketBilgi = selectedPaket ? `\n📦 ${selectedPaket.name}` : ''
    const typeLabel = appointmentType === 'online' ? '\n💻 Online' : '\n🏢 Yüz yüze'
    await sendReply(psychologistId, phone,
      `✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 ${text}\n📅 ${context.appointment_label}${typeLabel}${paketBilgi}\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.`
    )
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_real_phone') {
    const digits = text.replace(/\D/g, '')
    const normalized = digits.startsWith('0') ? '90' + digits.slice(1)
      : digits.startsWith('90') ? digits
      : digits.startsWith('5') ? '90' + digits
      : digits

    if (!isRealTurkishPhone(normalized)) {
      await sendReply(psychologistId, phone,
        'Geçerli bir Türkiye telefon numarası giriniz.\n\nÖrnek: *0532 XXX XX XX*'
      )
      return NextResponse.json({ ok: true })
    }

    const realPhone = normalized
    const nameSurname = (context.name_surname as string) ?? ''
    const appointmentType = (context.appointment_type as string) ?? 'yuzyuze'
    const selectedPaket = (context.selected_paket ?? null) as { name: string; session_count: number; price_tl: number } | null

    // Gerçek numarayla kayıtlı hasta var mı?
    const { data: existingByPhone } = await supabase
      .from('patients')
      .select('id')
      .eq('phone_number', realPhone)
      .eq('psychologist_id', psychologistId)
      .maybeSingle()

    let patientId: string
    if (existingByPhone) {
      await supabase.from('patients')
        .update({ name_surname: nameSurname, is_active: true, whatsapp_jid: replyJid ?? null })
        .eq('id', existingByPhone.id)
      patientId = existingByPhone.id
    } else {
      // @lid session'ı gerçek numarayla aynı hastaya taşı (sahte numaralı kaydı güncelle)
      const { data: existingByLid } = await supabase
        .from('patients')
        .select('id')
        .eq('phone_number', phone)
        .eq('psychologist_id', psychologistId)
        .maybeSingle()

      if (existingByLid) {
        await supabase.from('patients')
          .update({ phone_number: realPhone, name_surname: nameSurname, is_active: true, whatsapp_jid: replyJid ?? null })
          .eq('id', existingByLid.id)
        patientId = existingByLid.id
      } else {
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({ psychologist_id: psychologistId, name_surname: nameSurname, phone_number: realPhone, is_active: true, whatsapp_jid: replyJid ?? null })
          .select()
          .single()
        if (!newPatient) {
          await sendReply(psychologistId, phone, 'Bir hata oluştu. Lütfen tekrar deneyin.')
          return NextResponse.json({ ok: true })
        }
        patientId = newPatient.id
      }
    }

    let ucret: number | null = null
    let toplam_paket_seansi: number | null = null
    if (selectedPaket) {
      ucret = Math.round(selectedPaket.price_tl / selectedPaket.session_count)
      toplam_paket_seansi = selectedPaket.session_count
      await supabase.from('seans_paketleri').insert({
        patient_id: patientId,
        birim_fiyat: ucret,
        toplam_seans: selectedPaket.session_count,
        kullanilan_seans: 1,
        aktif: selectedPaket.session_count > 1,
      })
    }

    await supabase.from('appointments').insert({
      psychologist_id: psychologistId,
      patient_id: patientId,
      appointment_date: context.appointment_iso,
      duration_minutes: 50,
      status: 'seansify_pending',
      appointment_type: appointmentType,
      ucret,
      odeme_durumu: ucret != null ? 'bekliyor' : null,
      toplam_paket_seansi,
      mevcut_seans_no: toplam_paket_seansi != null ? 1 : null,
    })

    // Session'ı gerçek numaraya taşı
    await setSession(supabase, realPhone, psychologistId, 'idle', {})
    // Eski (sahte numaralı) session'ı temizle
    await supabase.from('wa_bot_sessions')
      .delete()
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)

    const paketBilgi = selectedPaket ? `\n📦 ${selectedPaket.name}` : ''
    const typeLabel = appointmentType === 'online' ? '\n💻 Online' : '\n🏢 Yüz yüze'
    await sendReply(psychologistId, phone,
      `✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 ${nameSurname}\n📅 ${context.appointment_label}${typeLabel}${paketBilgi}\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.`
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
