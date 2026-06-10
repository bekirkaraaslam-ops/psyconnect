import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

async function sendWithRetry(waUrl: string, waKey: string, psychologistId: string, phone: string, message: string, retries = 2, replyJid?: string | null) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${waUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': waKey },
        body: JSON.stringify({ psychologistId, phone, message, replyJid: replyJid ?? undefined }),
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) return
      console.warn(`[reschedule] attempt ${attempt + 1} failed: HTTP ${res.status}`)
    } catch (e) {
      console.warn(`[reschedule] attempt ${attempt + 1} error:`, e)
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
  }
  console.error(`[reschedule] all WA attempts failed`)
}

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params
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
  const { newDate, reason } = body as { newDate: string; reason: string }

  if (!newDate || !reason?.trim()) {
    return NextResponse.json({ error: 'newDate ve reason zorunlu' }, { status: 400 })
  }

  const { data: apt } = await supabase
    .from('appointments')
    .select('id, appointment_date, patient:patients(name_surname, phone_number, whatsapp_jid)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })

  const { error } = await supabase
    .from('appointments')
    .update({ appointment_date: newDate, reminder_sent: false, reminder_sent_at: null })
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  revalidatePath('/dashboard')
  revalidatePath('/appointments')

  const waUrl = process.env.WA_SERVICE_URL
  const waKey = process.env.WA_API_KEY
  const patient = apt.patient as unknown as { name_surname: string; phone_number: string; whatsapp_jid?: string | null } | null

  if (patient?.phone_number && waUrl && waKey && psychologist.is_connected) {
    const fmt = (iso: string) =>
      new Date(iso).toLocaleString('tr-TR', {
        day: 'numeric', month: 'long', weekday: 'long',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Europe/Istanbul',
      })

    const message =
      `Sayın ${patient.name_surname},\n\n` +
      `${fmt(apt.appointment_date)} tarihindeki randevunuz, *${reason.trim()}* nedeniyle ` +
      `*${fmt(newDate)}* tarihine ertelenmiştir. Anlayışınız için teşekkür ederiz.\n\n` +
      `Bu randevu tarihi/saati sizin için uygun değilse lütfen klinikle iletişime geçiniz.`

    await sendWithRetry(waUrl, waKey, psychologist.id, patient.phone_number, message, 2, patient.whatsapp_jid)
  }

  return NextResponse.json({ ok: true })
}
