import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    token,
    sikayet,
    sure,
    gecmis_tedavi,
    ilac_kullanim,
    aile_gecmis,
    uyku_durum,
    beslenme_durum,
    acil_kisi,
    ek_notlar,
  } = body

  if (!token) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data: form } = await supabase
    .from('anamnez_forms')
    .select('id, expires_at, filled_at')
    .eq('token', token)
    .maybeSingle()

  if (!form) {
    return NextResponse.json({ error: 'Geçersiz link.' }, { status: 404 })
  }

  if (new Date(form.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Bu linkin süresi dolmuş.' }, { status: 410 })
  }

  if (form.filled_at) {
    return NextResponse.json({ error: 'Bu form zaten doldurulmuş.' }, { status: 409 })
  }

  function enc(val: string | undefined): string | null {
    return val?.trim() ? encrypt(val.trim()) : null
  }

  const { error } = await supabase
    .from('anamnez_forms')
    .update({
      filled_at:                new Date().toISOString(),
      sikayet_encrypted:        enc(sikayet),
      sure_encrypted:           enc(sure),
      gecmis_tedavi_encrypted:  enc(gecmis_tedavi),
      ilac_kullanim_encrypted:  enc(ilac_kullanim),
      aile_gecmis_encrypted:    enc(aile_gecmis),
      uyku_durum_encrypted:     enc(uyku_durum),
      beslenme_durum_encrypted: enc(beslenme_durum),
      acil_kisi_encrypted:      enc(acil_kisi),
      ek_notlar_encrypted:      enc(ek_notlar),
    })
    .eq('id', form.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
