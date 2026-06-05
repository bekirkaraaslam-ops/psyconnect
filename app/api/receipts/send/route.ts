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
  const H = doc.page.height  // 595.28
  const M = 36

  const regular = 'NotoSans'
  const bold = 'NotoSans-Bold'
  doc.registerFont('NotoSans', fontBuffer)
  doc.registerFont('NotoSans-Bold', boldBuffer)

  // ── HEADER ───────────────────────────────────────────────────
  doc.rect(0, 0, W, 72).fill('#0d1f18')

  // Decorative circles (faint, dark header)
  doc.save()
  doc.circle(W + 10, -15, 90).fill('#1a3d2b')
  doc.circle(W - 20, 85, 55).fill('#163324')
  doc.restore()

  // Brand
  doc.font(bold).fontSize(19).fillColor('#f8fafc')
  doc.text('SEANSIFY', M, 20, { lineBreak: false })

  doc.font(regular).fontSize(7.5).fillColor('#6ee7b7')
  doc.text('SEANS MAKBUZU', M, 44, { lineBreak: false })

  // Receipt badge (top right)
  const badgeX = W - M - 80
  doc.roundedRect(badgeX, 18, 80, 20, 5).fill('#163324')
  doc.font(bold).fontSize(7.5).fillColor('#6ee7b7')
  doc.text(`#${data.receiptNo}`, badgeX, 26, { width: 80, align: 'center', lineBreak: false })

  doc.font(regular).fontSize(6.5).fillColor('#4a7c6f')
  doc.text(data.issuedAt, badgeX - 4, 44, { width: 88, align: 'right', lineBreak: false })

  // ── ACCENT STRIP ─────────────────────────────────────────────
  doc.rect(0, 72, W, 3).fill('#4a7c6f')

  // ── PSYCHOLOGIST SECTION ──────────────────────────────────────
  const sec1Y = 82
  doc.font(regular).fontSize(7).fillColor('#94a3b8')
  doc.text('DÜZENLEYEN', M, sec1Y, { lineBreak: false })

  doc.font(bold).fontSize(12.5).fillColor('#0d1f18')
  doc.text(data.psychName, M, sec1Y + 13, { lineBreak: false })

  doc.font(regular).fontSize(8).fillColor('#64748b')
  doc.text('Klinik Psikolog  •  Özel Pratik', M, sec1Y + 30, { lineBreak: false })

  // Right side: issue date
  doc.font(regular).fontSize(7).fillColor('#94a3b8')
  doc.text('Düzenlenme Tarihi', 0, sec1Y, { width: W - M, align: 'right', lineBreak: false })
  doc.font(bold).fontSize(8).fillColor('#4a7c6f')
  doc.text(data.issuedAt, 0, sec1Y + 13, { width: W - M, align: 'right', lineBreak: false })

  // ── DASHED DIVIDER ───────────────────────────────────────────
  const div1Y = 126
  doc.moveTo(M, div1Y).lineTo(W - M, div1Y)
    .dash(2, { space: 4 }).lineWidth(0.6).strokeColor('#cbd5e1').stroke()
  doc.undash()

  // ── PATIENT CARD ─────────────────────────────────────────────
  const cardY = 134
  const cardH = 48
  doc.rect(M, cardY, W - M * 2, cardH).fill('#f0fdf4')
  doc.rect(M, cardY, 3, cardH).fill('#4a7c6f')

  // Avatar
  const initials = data.patientName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  doc.circle(M + 28, cardY + cardH / 2, 18).fill('#0d1f18')
  doc.font(bold).fontSize(10).fillColor('#6ee7b7')
  const avX = M + 28 - (initials.length > 1 ? 9 : 5)
  doc.text(initials, avX, cardY + cardH / 2 - 7, { lineBreak: false })

  doc.font(regular).fontSize(7).fillColor('#4a7c6f')
  doc.text('DANIŞAN', M + 56, cardY + 9, { lineBreak: false })
  doc.font(bold).fontSize(13).fillColor('#0d1f18')
  doc.text(data.patientName, M + 56, cardY + 22, { lineBreak: false })

  // ── DETAILS TABLE ────────────────────────────────────────────
  const tableY = cardY + cardH + 14
  const rows: [string, string, boolean][] = [
    ['Seans Tarihi', data.appointmentDate, false],
    ['Seans Süresi', `${data.durationMinutes} dakika`, false],
    ['Seans Türü', data.appointmentType === 'online' ? 'Online' : 'Yüz yüze', false],
    ['Ödeme Durumu', 'Tahsil Edildi', true],
  ]

  rows.forEach(([label, value, isPayment], i) => {
    const rowY = tableY + i * 24
    if (i % 2 === 0) doc.rect(M, rowY, W - M * 2, 24).fill('#fafafa')
    doc.font(regular).fontSize(8.5).fillColor('#64748b')
    doc.text(label, M + 8, rowY + 7, { lineBreak: false })
    doc.font(bold).fontSize(8.5).fillColor(isPayment ? '#15803d' : '#0d1f18')
    doc.text(value, 0, rowY + 7, { width: W - M - 8, align: 'right', lineBreak: false })
    if (i < rows.length - 1) {
      doc.moveTo(M, rowY + 24).lineTo(W - M, rowY + 24)
        .lineWidth(0.5).strokeColor('#f1f5f9').stroke()
    }
  })

  const tableBottom = tableY + rows.length * 24
  doc.moveTo(M, tableBottom).lineTo(W - M, tableBottom)
    .lineWidth(1).strokeColor('#e2e8f0').stroke()

  // ── AMOUNT BOX ───────────────────────────────────────────────
  const boxY = tableBottom + 16
  const boxH = 60
  doc.rect(M, boxY, W - M * 2, boxH).fill('#0d1f18')

  // Subtle circle decoration inside box
  doc.save()
  doc.circle(W - M + 10, boxY + boxH / 2, 42).fill('#163324')
  doc.restore()

  doc.font(regular).fontSize(7.5).fillColor('#6ee7b7')
  doc.text('TAHSİL EDİLEN TUTAR', M + 14, boxY + 11, { lineBreak: false })

  const amountText = `₺${data.ucret.toLocaleString('tr-TR')}`
  doc.font(bold).fontSize(28).fillColor('#f8fafc')
  doc.text(amountText, 0, boxY + 16, { width: W - M - 14, align: 'right', lineBreak: false })

  doc.font(regular).fontSize(7).fillColor('#4a7c6f')
  doc.text('Ödeme alindi  ✓', M + 14, boxY + 42, { lineBreak: false })

  // ── LEGAL NOTE ───────────────────────────────────────────────
  const legalY = boxY + boxH + 16
  doc.rect(M, legalY, W - M * 2, 52).fill('#f8fafc')
  doc.rect(M, legalY, W - M * 2, 52).strokeColor('#e5e7eb').lineWidth(0.5).stroke()
  doc.rect(M, legalY, 3, 52).fill('#cbd5e1')

  doc.font(bold).fontSize(7).fillColor('#94a3b8')
  doc.text('Bilgilendirme Amaçlıdır', M + 11, legalY + 8, { lineBreak: false })
  doc.font(regular).fontSize(6.5).fillColor('#b0b8c4')
  doc.text(
    'Bu belge, psikolojik danışmanlık seansına ait ödeme bilgisini özetlemek amacıyla oluşturulmuştur. Resmi vergi makbuzu veya fatura niteliği taşımamaktadır. Resmi belge talebi için psikologunuzla iletişime geçiniz.',
    M + 11, legalY + 21,
    { width: W - M * 2 - 22, lineGap: 1.5, lineBreak: true },
  )

  // ── FOOTER ───────────────────────────────────────────────────
  const footerY = H - 34
  doc.rect(0, footerY, W, 34).fill('#f0fdf4')
  doc.moveTo(0, footerY).lineTo(W, footerY).lineWidth(0.5).strokeColor('#c8e6de').stroke()

  doc.font(bold).fontSize(9).fillColor('#4a7c6f')
  doc.text('SEANSIFY', 0, footerY + 8, { width: W, align: 'center', lineBreak: false })
  doc.font(regular).fontSize(7).fillColor('#94a3b8')
  doc.text('seansify.com', 0, footerY + 21, { width: W, align: 'center', lineBreak: false })

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

  const { data: apt } = await supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('id', appointmentId)
    .eq('psychologist_id', psych.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 })
  if (apt.odeme_durumu !== 'odendi') return NextResponse.json({ error: 'Randevu ödenmedi olarak işaretlenmemiş' }, { status: 400 })

  const patientPhone: string | null =
    (apt.patient as { phone_number?: string } | null)?.phone_number ??
    (apt as { booking_phone?: string }).booking_phone ??
    null

  if (!patientPhone) return NextResponse.json({ error: 'Danışan telefon numarası yok' }, { status: 422 })

  const patientName: string =
    (apt.patient as { name_surname?: string } | null)?.name_surname ??
    (apt as { booking_name?: string }).booking_name ??
    'Danışan'

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

  await supabase
    .from('appointments')
    .update({ makbuz_gonderildi_at: new Date().toISOString() })
    .eq('id', appointmentId)

  return NextResponse.json({ ok: true, receiptNo })
}
