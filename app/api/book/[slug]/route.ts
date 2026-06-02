import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAktifPaket, incrementPaket } from '@/lib/paket'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

interface Context {
  params: Promise<{ slug: string }>
}

// GET: Psikolog bilgisi + dolu slotlar
export async function GET(_req: NextRequest, { params }: Context) {
  const { slug } = await params
  const supabase = getSupabase()

  const { data: psych, error } = await supabase
    .from('psychologists')
    .select('id, full_name, session_duration_minutes, buffer_minutes, work_start_hour, work_end_hour, work_days, subscription_status, tatil_modu')
    .eq('booking_slug', slug)
    .single()

  if (error || !psych) {
    return NextResponse.json({ error: 'Psikolog bulunamadı.' }, { status: 404 })
  }

  if (!['active', 'trial'].includes(psych.subscription_status)) {
    return NextResponse.json({ error: 'Bu psikolog şu an randevu kabul etmiyor.' }, { status: 403 })
  }

  if (psych.tatil_modu) {
    return NextResponse.json({ error: 'tatil_modu' }, { status: 423 })
  }

  // Önümüzdeki 28 günün onaylı randevularını çek
  const from = new Date().toISOString()
  const to = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_date, duration_minutes')
    .eq('psychologist_id', psych.id)
    .gte('appointment_date', from)
    .lte('appointment_date', to)
    .not('status', 'in', '("canceled","cancelled_by_patient")')

  // Dolu slotları ISO string olarak döndür
  const bookedSlots = (appointments ?? []).map(a => new Date(a.appointment_date).toISOString())

  return NextResponse.json({
    psychologist: {
      id: psych.id,
      full_name: psych.full_name,
      session_duration_minutes: psych.session_duration_minutes ?? 50,
      buffer_minutes: psych.buffer_minutes ?? 10,
      work_start_hour: psych.work_start_hour ?? 9,
      work_end_hour: psych.work_end_hour ?? 18,
      work_days: psych.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'],
    },
    bookedSlots,
  })
}

// POST: Randevu talebi oluştur
export async function POST(req: NextRequest, { params }: Context) {
  const { slug } = await params
  const supabase = getSupabase()

  const body = await req.json()
  const { slot, name, phone, appointment_type, package_template_id, kvkk_consented } = body

  if (!slot || !name || !phone) {
    return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 })
  }

  const { data: psych, error: psychError } = await supabase
    .from('psychologists')
    .select('id, full_name, session_duration_minutes, subscription_status, tatil_modu')
    .eq('booking_slug', slug)
    .single()

  if (psychError || !psych) {
    return NextResponse.json({ error: 'Psikolog bulunamadı.' }, { status: 404 })
  }

  if (!['active', 'trial'].includes(psych.subscription_status)) {
    return NextResponse.json({ error: 'Bu psikolog şu an randevu kabul etmiyor.' }, { status: 403 })
  }

  if (psych.tatil_modu) {
    return NextResponse.json({ error: 'tatil_modu' }, { status: 423 })
  }

  const normalizedPhone = normalizePhone(phone)
  const slotDate = new Date(slot)

  // Geçmiş slot kontrolü
  if (slotDate.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Bu saat geçmiş.' }, { status: 400 })
  }

  // Çakışma kontrolü
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('psychologist_id', psych.id)
    .eq('appointment_date', slotDate.toISOString())
    .not('status', 'in', '("canceled","cancelled_by_patient")')
    .maybeSingle()

  if (conflict) {
    return NextResponse.json({ error: 'Bu saat artık müsait değil. Lütfen başka bir zaman seçin.' }, { status: 409 })
  }

  // Aynı telefondan bekleyen talep var mı?
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('psychologist_id', psych.id)
    .eq('phone_number', normalizedPhone)
    .maybeSingle()

  if (existingPatient) {
    const { data: pendingApt } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', existingPatient.id)
      .eq('status', 'seansify_pending')
      .maybeSingle()

    if (pendingApt) {
      return NextResponse.json({ error: 'Bekleyen bir randevu talebiniz zaten var.' }, { status: 400 })
    }
  }

  // Seçilen paket şablonunu çek (varsa)
  let paketSablon: { session_count: number; price_tl: number } | null = null
  if (package_template_id) {
    const { data: tmpl } = await supabase
      .from('paket_sablonlari')
      .select('session_count, price_tl')
      .eq('id', package_template_id)
      .eq('psychologist_id', psych.id)
      .eq('is_active', true)
      .maybeSingle()
    paketSablon = tmpl ?? null
  }

  // Ücret: yeni paket seçildiyse seans başı fiyat, yoksa aktif mevcut paketten al
  let paketUcret: number | null = null
  let toplam_paket_seansi: number | null = null

  if (paketSablon) {
    paketUcret = Math.round(paketSablon.price_tl / paketSablon.session_count)
    toplam_paket_seansi = paketSablon.session_count
  } else if (existingPatient?.id) {
    const pkg = await getAktifPaket(supabase, existingPatient.id)
    paketUcret = pkg?.birim_fiyat ?? null
  }

  // Hasta kaydı yok veya geçici placeholder — randevu oluştur (hasta approve'da eklenir)
  const { error: insertError } = await supabase
    .from('appointments')
    .insert({
      psychologist_id: psych.id,
      patient_id: existingPatient?.id ?? null,
      appointment_date: slotDate.toISOString(),
      duration_minutes: psych.session_duration_minutes ?? 50,
      status: 'seansify_pending',
      source: 'booking_page',
      booking_name: name,
      booking_phone: normalizedPhone,
      appointment_type: appointment_type === 'online' ? 'online' : 'yuzyuze',
      kvkk_consented_at: kvkk_consented ? new Date().toISOString() : null,
      ucret: paketUcret,
      odeme_durumu: 'bekliyor',
      toplam_paket_seansi,
      mevcut_seans_no: toplam_paket_seansi != null ? 1 : null,
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Mevcut hasta + yeni paket şablonu seçildiyse seans_paketleri kaydı oluştur
  if (existingPatient?.id && paketSablon) {
    await supabase.from('seans_paketleri').insert({
      patient_id: existingPatient.id,
      birim_fiyat: paketUcret,
      toplam_seans: paketSablon.session_count,
      kullanilan_seans: 1,
      aktif: paketSablon.session_count > 1,
    })
  } else if (existingPatient?.id && !paketSablon) {
    // Mevcut paket varsa increment et
    await incrementPaket(supabase, existingPatient.id)
  }

  // Danışana WhatsApp onay mesajı gönder
  const waUrl = process.env.WA_SERVICE_URL
  const waKey = process.env.WA_API_KEY
  if (waUrl && waKey) {
    const aptLabel = slotDate.toLocaleString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    })
    fetch(`${waUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': waKey },
      body: JSON.stringify({
        psychologistId: psych.id,
        phone: normalizedPhone,
        message: `Merhaba ${name}, randevu talebiniz alındı (${aptLabel}). Psikologunuz onayladığında tekrar bildirim alacaksınız.`,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
