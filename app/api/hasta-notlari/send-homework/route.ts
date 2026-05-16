import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, is_connected')
    .eq('auth_user_id', user.id)
    .single()
  if (!psychologist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!psychologist.is_connected) return NextResponse.json({ error: 'WhatsApp bağlı değil.' }, { status: 400 })

  const body = await req.json()
  const { nota_id } = body
  if (!nota_id) return NextResponse.json({ error: 'nota_id gerekli' }, { status: 400 })

  const { data: nota } = await supabase
    .from('hasta_notlari')
    .select('ev_odevi_encrypted, hasta_id, seans_tarihi')
    .eq('id', nota_id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!nota) return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
  if (!nota.ev_odevi_encrypted) return NextResponse.json({ error: 'Bu seansta ev ödevi yok.' }, { status: 400 })

  const { data: hasta } = await supabase
    .from('patients')
    .select('name_surname, phone_number')
    .eq('id', nota.hasta_id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!hasta) return NextResponse.json({ error: 'Hasta bulunamadı' }, { status: 404 })

  let evOdevi: string
  try { evOdevi = decrypt(nota.ev_odevi_encrypted) } catch {
    return NextResponse.json({ error: 'Şifre çözülemedi.' }, { status: 500 })
  }

  const dateStr = new Date(nota.seans_tarihi).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const message =
    `Sayın ${hasta.name_surname},\n\n` +
    `*${dateStr}* tarihli seans sonrası ev ödeviniz:\n\n` +
    `${evOdevi}\n\n` +
    `— *${psychologist.full_name}*`

  const res = await fetch(`${process.env.WA_SERVICE_URL}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.WA_API_KEY!,
    },
    body: JSON.stringify({ psychologistId: psychologist.id, phone: hasta.phone_number, message }),
  })

  if (!res.ok) return NextResponse.json({ error: 'WhatsApp gönderilemedi.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
