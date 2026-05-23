import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']

async function sendWhatsApp(psychologistId: string, phone: string, message: string) {
  if (!process.env.WA_SERVICE_URL || !process.env.WA_API_KEY) return
  try {
    await fetch(`${process.env.WA_SERVICE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.WA_API_KEY },
      body: JSON.stringify({ psychologistId, phone, message }),
    })
  } catch {
    // Bildirim hatası randevu kaydını engellemez
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, is_connected')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { patient_id, appointment_date, duration_minutes, status, appointment_type, toplam_paket_seansi, mevcut_seans_no, is_first_session, recurring } = body

  if (!patient_id || !appointment_date) {
    return NextResponse.json({ error: 'Hasta ve tarih zorunludur.' }, { status: 400 })
  }

  const baseRecord = {
    psychologist_id: psychologist.id,
    patient_id,
    duration_minutes: duration_minutes ?? 50,
    status: status ?? 'waiting',
    appointment_type: appointment_type ?? 'yuzyuze',
    toplam_paket_seansi: toplam_paket_seansi ?? null,
    mevcut_seans_no: mevcut_seans_no ?? null,
    is_first_session: is_first_session ?? false,
  }

  // Tekrarlayan randevu
  if (recurring?.frequency && recurring?.endDate) {
    const dates: string[] = []
    const start = new Date(appointment_date)
    const end = new Date(recurring.endDate)
    const intervalDays = recurring.frequency === 'weekly' ? 7 : recurring.frequency === 'biweekly' ? 14 : 30

    const cursor = new Date(start)
    while (cursor <= end) {
      dates.push(cursor.toISOString())
      if (recurring.frequency === 'monthly') {
        cursor.setMonth(cursor.getMonth() + 1)
      } else {
        cursor.setDate(cursor.getDate() + intervalDays)
      }
    }

    if (dates.length === 0) {
      return NextResponse.json({ error: 'Geçerli tarih aralığı bulunamadı.' }, { status: 400 })
    }

    const records = dates.map(date => ({ ...baseRecord, appointment_date: date }))
    const { error } = await supabase.from('appointments').insert(records)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ count: records.length }, { status: 201 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...baseRecord, appointment_date })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Hastaya WhatsApp bildirimi gönder
  if (psychologist.is_connected) {
    const { data: patient } = await supabase
      .from('patients')
      .select('name_surname, phone_number')
      .eq('id', patient_id)
      .single()

    if (patient?.phone_number) {
      const d = new Date(appointment_date)
      const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      const msg = `📅 Randevunuz oluşturuldu!\n\n👤 ${patient.name_surname}\n🗓 ${dateStr} — ${timeStr}\n\nRandevunuzu onaylamak için *ONAYLA*, iptal için *İPTAL* yazabilirsiniz.`
      await sendWhatsApp(psychologist.id, patient.phone_number, msg)
    }
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  let query = supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('psychologist_id', psychologist!.id)
    .order('appointment_date')

  if (from) query = query.gte('appointment_date', from)
  if (to) query = query.lte('appointment_date', to)

  const { data } = await query
  return NextResponse.json(data)
}
