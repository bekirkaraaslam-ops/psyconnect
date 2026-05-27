import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PDFDocument from 'pdfkit'
import { readFileSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

async function generatePDF(data: {
  psychName: string
  patientName: string
  appointmentDate: string
  durationMinutes: number
  appointmentType: string | null
  ucret: number
  receiptNo: string
  issuedAt: string
}): Promise<Buffer> {
  const fontsDir = path.join(process.cwd(), 'lib', 'fonts')
  const fontBuffer = readFileSync(path.join(fontsDir, 'NotoSans.ttf'))
  const boldBuffer = readFileSync(path.join(fontsDir, 'NotoSans-Bold.ttf'))

  const doc = new PDFDocument({ size: 'A5', margin: 0 })
  const W = doc.page.width   // 419.53
  const M = 40               // iç margin

  const regular = 'NotoSans'
  const bold = 'NotoSans-Bold'
  doc.registerFont('NotoSans', fontBuffer)
  doc.registerFont('NotoSans-Bold', boldBuffer)

  // ── Üst koyu başlık ──────────────────────────────────────────
  doc.rect(0, 0, W, 65).fill('#0d1f18')

  // Seansify brand
  doc.font(bold).fontSize(15).fillColor('#f8fafc')
  doc.text('SEANSIFY', M, 20)

  doc.font(regular).fontSize(8).fillColor('#6ee7b7')
  doc.text('SEANS MAKBUZU', M, 40)

  // Makbuz No (sağ taraf)
  doc.font(regular).fontSize(7.5).fillColor('#94a3b8')
  doc.text(`#${data.receiptNo}`, 0, 20, { width: W - M, align: 'right' })
  doc.font(regular).fontSize(7.5).fillColor('#6ee7b7')
  doc.text(data.issuedAt, 0, 32, { width: W - M, align: 'right' })

  // ── Yeşil ince şerit ─────────────────────────────────────────
  doc.rect(0, 65, W, 3).fill('#4a7c6f')

  // ── Psikolog bilgi alanı ──────────────────────────────────────
  doc.rect(0, 68, W, 44).fill('#f8fffe')

  doc.font(bold).fontSize(11).fillColor('#0d1f18')
  doc.text(data.psychName, M, 80)

  doc.font(regular).fontSize(8).fillColor('#4a7c6f')
  doc.text('Klinik Psikolog • Özel Pratik', M, 96)

  // Alt ince çizgi
  doc.moveTo(M, 112).lineTo(W - M, 112).lineWidth(0.5).strokeColor('#e2ece9').stroke()

  // ── Danışan kartı ──────────────────────────────────────────────
  const cardY = 124
  doc.rect(M, cardY, W - M * 2, 44).fill('#f0fdf4')
  doc.rect(M, cardY, 3, 44).fill('#4a7c6f')  // sol çubuk

  // Baş harfler avatar
  const initials = data.patientName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  doc.circle(M + 24, cardY + 22, 16).fill('#0d1f18')
  doc.font(bold).fontSize(10).fillColor('#6ee7b7')
  const avatarX = M + 24 - (initials.length > 1 ? 9 : 5)
  doc.text(initials, avatarX, cardY + 15)

  doc.font(regular).fontSize(7.5).fillColor('#4a7c6f')
  doc.text('DANIŞAN', M + 48, cardY + 10)
  doc.font(bold).fontSize(12).fillColor('#0d1f18')
  doc.text(data.patientName, M + 48, cardY + 22)

  // ── Detay tablosu ──────────────────────────────────────────────
  const tableY = cardY + 58
  const rows: [string, string][] = [
    ['Seans Tarihi', data.appointmentDate],
    ['Seans Süresi', `${data.durationMinutes} dakika`],
    ['Seans Türü', data.appointmentType === 'online' ? 'Online' : 'Yüz yüze'],
    ['Ödeme Durumu', 'Tahsil Edildi'],
  ]

  rows.forEach(([label, value], i) => {
    const rowY = tableY + i * 24
    if (i < rows.length - 1) {
      doc.moveTo(M, rowY + 22).lineTo(W - M, rowY + 22).lineWidth(0.5).strokeColor('#f1f5f9').stroke()
    }
    doc.font(regular).fontSize(9).fillColor('#64748b')
    doc.text(label, M, rowY + 6)
    doc.font(bold).fontSize(9).fillColor('#0d1f18')
    doc.text(value, 0, rowY + 6, { width: W - M, align: 'right' })
  })

  // ── Tutar kutusu ──────────────────────────────────────────────
  const boxY = tableY + rows.length * 24 + 14
  doc.roundedRect(M, boxY, W - M * 2, 52, 8).fill('#0d1f18')

  doc.font(regular).fontSize(8).fillColor('#6ee7b7')
  doc.text('TAHSİL EDİLEN TUTAR', M + 12, boxY + 10)
  doc.font(regular).fontSize(7.5).fillColor('#4a7c6f')
  doc.text('Ödeme alındı', M + 12, boxY + 24)

  doc.font(bold).fontSize(26).fillColor('#f8fafc')
  const amountText = `₺${data.ucret.toLocaleString('tr-TR')}`
  doc.text(amountText, 0, boxY + 12, { width: W - M, align: 'right' })

  // ── Yasal uyarı ──────────────────────────────────────────────
  const legalY = boxY + 66
  doc.rect(M, legalY, W - M * 2, 54).fill('#fafafa').strokeColor('#e8ece9').lineWidth(0.5).stroke()

  doc.font(bold).fontSize(7).fillColor('#64748b')
  doc.text('Bilgilendirme Amaçlıdır', M + 8, legalY + 8)
  doc.font(regular).fontSize(6.8).fillColor('#94a3b8')
  doc.text(
    'Bu belge, psikolojik danışmanlık seansına ait ödeme bilgisini özetlemek amacıyla otomatik olarak oluşturulmuştur. Resmi vergi makbuzu veya fatura niteliği taşımamaktadır. Resmi belge talebi için lütfen psikologunuzla iletişime geçiniz.',
    M + 8, legalY + 20,
    { width: W - M * 2 - 16, lineGap: 1 },
  )

  // ── Alt şerit ────────────────────────────────────────────────
  const footerY = doc.page.height - 28
  doc.rect(0, footerY, W, 28).fill('#f8fffe')
  doc.moveTo(0, footerY).lineTo(W, footerY).lineWidth(0.5).strokeColor('#e2ece9').stroke()

  doc.font(bold).fontSize(8).fillColor('#4a7c6f')
  doc.text('• SEANSIFY •', 0, footerY + 9, { align: 'center' })
  doc.font(regular).fontSize(7).fillColor('#94a3b8')
  doc.text('seansify.com', 0, footerY + 19, { align: 'center' })

  doc.end()

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Psikolog bulunamadı' }, { status: 404 })

  const body = await req.json()
  const { appointmentId } = body
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId gerekli' }, { status: 400 })

  // Randevu + hasta bilgisi
  const { data: apt } = await supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('id', appointmentId)
    .eq('psychologist_id', psych.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })
  if (apt.odeme_durumu !== 'odendi') return NextResponse.json({ error: 'Randevu ödenmedi olarak işaretlenmemiş' }, { status: 400 })

  // Telefon numarasını belirle
  const patientPhone: string | null =
    (apt.patient as { phone_number?: string } | null)?.phone_number ??
    (apt as { booking_phone?: string }).booking_phone ??
    null

  if (!patientPhone) return NextResponse.json({ error: 'Danışan telefon numarası yok' }, { status: 422 })

  const patientName: string =
    (apt.patient as { name_surname?: string } | null)?.name_surname ??
    (apt as { booking_name?: string }).booking_name ??
    'Danışan'

  // Makbuz numarası: tarih + id'nin son 4 hanesi
  const aptDate = new Date(apt.appointment_date)
  const datePart = aptDate.toISOString().slice(0, 10).replace(/-/g, '')
  const receiptNo = `${datePart}-${appointmentId.slice(-4).toUpperCase()}`

  const issuedAt = new Date().toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })

  const appointmentDateStr = aptDate.toLocaleString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })

  // PDF üret
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await generatePDF({
      psychName: psych.full_name ?? 'Psikolog',
      patientName,
      appointmentDate: appointmentDateStr,
      durationMinutes: apt.duration_minutes ?? 50,
      appointmentType: apt.appointment_type,
      ucret: apt.ucret ?? 0,
      receiptNo,
      issuedAt,
    })
  } catch (err) {
    console.error('[receipt] PDF üretim hatası:', err)
    return NextResponse.json({ error: 'PDF oluşturulamadı' }, { status: 500 })
  }

  // WA servisine gönder
  const WA_URL = process.env.WA_SERVICE_URL
  const WA_KEY = process.env.WA_API_KEY

  if (!WA_URL || !WA_KEY) {
    return NextResponse.json({ error: 'WA servisi yapılandırılmamış' }, { status: 500 })
  }

  const waRes = await fetch(`${WA_URL}/send-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': WA_KEY },
    body: JSON.stringify({
      psychologistId: psych.id,
      phone: patientPhone,
      pdfBase64: pdfBuffer.toString('base64'),
      fileName: `seans-makbuz-${receiptNo}.pdf`,
      caption: `Merhaba! ${aptDate.toLocaleDateString('tr-TR')} tarihli seans ödemeleriniz alınmıştır. İyi günler dileriz. — ${psych.full_name ?? 'Psikologunuz'}`,
    }),
  })

  if (!waRes.ok) {
    const err = await waRes.json().catch(() => ({}))
    console.error('[receipt] WA gönderim hatası:', err)
    return NextResponse.json({ error: 'Makbuz gönderilemedi', detail: err }, { status: 502 })
  }

  // makbuz_gonderildi_at güncelle
  await supabase
    .from('appointments')
    .update({ makbuz_gonderildi_at: new Date().toISOString() })
    .eq('id', appointmentId)

  return NextResponse.json({ ok: true, receiptNo })
}
