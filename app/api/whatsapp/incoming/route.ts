import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendReply(psychologistId: string, phone: string, message: string) {
  await fetch(`${process.env.WA_SERVICE_URL}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.WA_API_KEY! },
    body: JSON.stringify({ psychologistId, phone, message }),
  })
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 1; i <= 14 && result.length < 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (allowed.has(d.getDay())) {
      const iso = d.toISOString().split('T')[0]
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

  // UTC+3 (Türkiye) saatine çevirerek karşılaştır
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
  const { data } = await supabase
    .from('wa_bot_sessions')
    .select('step, context')
    .eq('phone_number', phone)
    .eq('psychologist_id', psychologistId)
    .maybeSingle()
  return data ?? { step: 'idle', context: {} }
}

async function setSession(
  supabase: ReturnType<typeof getSupabase>,
  phone: string,
  psychologistId: string,
  step: string,
  context: object
) {
  await supabase.from('wa_bot_sessions').upsert(
    { phone_number: phone, psychologist_id: psychologistId, step, context, updated_at: new Date().toISOString() },
    { onConflict: 'phone_number,psychologist_id' }
  )
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.WA_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { psychologistId, phone, message } = await req.json()
  if (!psychologistId || !phone || !message) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  const supabase = getSupabase()
  const text = String(message).trim()
  const textLower = text.toLowerCase().replace('i̇', 'i')

  const { data: psych } = await supabase
    .from('psychologists')
    .select('full_name, work_days, work_start_hour, work_end_hour, is_connected, booking_slug')
    .eq('id', psychologistId)
    .single()

  if (!psych?.is_connected) return NextResponse.json({ ok: true })

  const workDays: string[] = psych.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma']
  const workStart: number = psych.work_start_hour ?? 9
  const workEnd: number = psych.work_end_hour ?? 18

  // ── EVET / İPTAL — her state'de çalışır ─────────────────────
  if (textLower === 'evet' || textLower === 'onayla') {
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name_surname')
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .maybeSingle()

    if (patient) {
      const { data: apt } = await supabase
        .from('appointments')
        .select('id, appointment_date')
        .eq('patient_id', patient.id)
        .in('status', ['waiting', 'seansify_pending'])
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (apt) {
        await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', apt.id)
        const d = new Date(apt.appointment_date)
        const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
        const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        await sendReply(psychologistId, phone, `✅ Randevunuz onaylandı!\n\n📅 ${dateStr} — ${timeStr}\n\nGörüşmek üzere!`)
        return NextResponse.json({ ok: true })
      }
    }
    await sendReply(psychologistId, phone, 'Onaylanacak aktif bir randevunuz bulunamadı.')
    return NextResponse.json({ ok: true })
  }

  if (textLower === 'iptal') {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .maybeSingle()

    if (patient) {
      const { data: apt } = await supabase
        .from('appointments')
        .select('id')
        .eq('patient_id', patient.id)
        .in('status', ['waiting', 'confirmed', 'seansify_pending'])
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (apt) {
        await supabase.from('appointments').update({ status: 'cancelled_by_patient' }).eq('id', apt.id)

        const { data: currentPatient } = await supabase
          .from('patients')
          .select('cancel_count')
          .eq('id', patient.id)
          .single()
        await supabase
          .from('patients')
          .update({ cancel_count: (currentPatient?.cancel_count ?? 0) + 1 })
          .eq('id', patient.id)

        await sendReply(psychologistId, phone, `❌ Randevunuz iptal edildi.\n\nYeni randevu almak için *randevu* yazabilirsiniz.`)
        return NextResponse.json({ ok: true })
      }
    }
    await setSession(supabase, phone, psychologistId, 'idle', {})
    await sendReply(psychologistId, phone, 'İptal edilecek aktif bir randevunuz bulunamadı.')
    return NextResponse.json({ ok: true })
  }

  // ── STATE MACHINE ────────────────────────────────────────────
  const session = await getSession(supabase, phone, psychologistId)
  const { step, context } = session as { step: string; context: Record<string, unknown> }

  if (step === 'idle') {
    if (textLower === 'randevu') {
      const days = getAvailableDays(workDays)
      if (days.length === 0) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seansify.com'
        const waitSlug = psych.booking_slug ?? psychologistId
        const waitUrl = `${appUrl}/bekle/${waitSlug}`
        await sendReply(psychologistId, phone, `Şu an müsait randevu günü bulunmamaktadır.\n\nBekleme listesine eklenip boşalan randevulardan haberdar olmak ister misiniz? 👇\n${waitUrl}`)
        return NextResponse.json({ ok: true })
      }
      const list = days.map((d, i) => `${i + 1}️⃣ ${d.label}`).join('\n')
      await setSession(supabase, phone, psychologistId, 'awaiting_day', { available_days: days })
      await sendReply(psychologistId, phone, `📅 Müsait günler:\n\n${list}\n\nTercih ettiğiniz günün numarasını yazın.`)
    }
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_day') {
    const days = (context.available_days ?? []) as { label: string; iso: string }[]
    const n = parseInt(text)
    if (isNaN(n) || n < 1 || n > days.length) {
      const list = days.map((d, i) => `${i + 1}️⃣ ${d.label}`).join('\n')
      await sendReply(psychologistId, phone, `Lütfen 1-${days.length} arası bir numara girin:\n\n${list}`)
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
    const times = (context.available_times ?? []) as string[]
    const n = parseInt(text)
    if (isNaN(n) || n < 1 || n > times.length) {
      const slotList = times.map((s, i) => `${i + 1}️⃣ ${s}`).join('\n')
      await sendReply(psychologistId, phone, `Lütfen 1-${times.length} arası bir numara girin:\n\n${slotList}`)
      return NextResponse.json({ ok: true })
    }
    const selectedTime = times[n - 1]
    const aptIso = new Date(`${context.day_iso}T${selectedTime}:00+03:00`).toISOString()
    const aptLabel = `${context.day_label} — ${selectedTime}`

    const { data: patient } = await supabase
      .from('patients')
      .select('id, name_surname')
      .eq('phone_number', phone)
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .maybeSingle()

    if (patient) {
      await supabase.from('appointments').insert({
        psychologist_id: psychologistId,
        patient_id: patient.id,
        appointment_date: aptIso,
        duration_minutes: 50,
        status: 'seansify_pending',
        appointment_type: 'yuzyuze',
      })
      await setSession(supabase, phone, psychologistId, 'idle', {})
      await sendReply(psychologistId, phone,
        `✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 ${(patient as { id: string; name_surname: string }).name_surname}\n📅 ${aptLabel}\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.`
      )
    } else {
      await setSession(supabase, phone, psychologistId, 'awaiting_name', {
        appointment_iso: aptIso,
        appointment_label: aptLabel,
      })
      await sendReply(psychologistId, phone, `Son olarak adınızı ve soyadınızı yazar mısınız?`)
    }
    return NextResponse.json({ ok: true })
  }

  if (step === 'awaiting_name') {
    if (text.length < 3 || !text.includes(' ')) {
      await sendReply(psychologistId, phone, 'Lütfen adınızı ve soyadınızı tam olarak yazın. Örnek: *Ahmet Yılmaz*')
      return NextResponse.json({ ok: true })
    }
    const { data: newPatient } = await supabase
      .from('patients')
      .insert({ psychologist_id: psychologistId, name_surname: text, phone_number: phone, is_active: true })
      .select()
      .single()

    if (!newPatient) {
      await sendReply(psychologistId, phone, 'Bir hata oluştu. Lütfen tekrar deneyin.')
      return NextResponse.json({ ok: true })
    }

    await supabase.from('appointments').insert({
      psychologist_id: psychologistId,
      patient_id: newPatient.id,
      appointment_date: context.appointment_iso,
      duration_minutes: 50,
      status: 'seansify_pending',
      appointment_type: 'yuzyuze',
    })
    await setSession(supabase, phone, psychologistId, 'idle', {})
    await sendReply(psychologistId, phone,
      `✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 ${text}\n📅 ${context.appointment_label}\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.`
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
