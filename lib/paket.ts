import type { SupabaseClient } from '@supabase/supabase-js'

export interface AktifPaket {
  id: string
  birim_fiyat: number
  kullanilan_seans: number
  toplam_seans: number
}

export async function getAktifPaket(
  supabase: SupabaseClient,
  patientId: string
): Promise<AktifPaket | null> {
  const { data } = await supabase
    .from('seans_paketleri')
    .select('id, birim_fiyat, kullanilan_seans, toplam_seans')
    .eq('patient_id', patientId)
    .eq('aktif', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as AktifPaket | null
}

// Paket kullanımını +1 artırır. Bittiyse pasife alır.
// Dönüş: paketin birim_fiyat'ı (randevu ücreti için kullanılır), yoksa null.
export async function incrementPaket(
  supabase: SupabaseClient,
  patientId: string
): Promise<number | null> {
  const pkg = await getAktifPaket(supabase, patientId)
  if (!pkg) return null

  const yeni = pkg.kullanilan_seans + 1
  await supabase
    .from('seans_paketleri')
    .update({ kullanilan_seans: yeni, aktif: yeni < pkg.toplam_seans })
    .eq('id', pkg.id)

  return pkg.birim_fiyat
}
