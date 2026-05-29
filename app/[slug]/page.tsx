import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import ProfilClient from './ProfilClient'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Context {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabase()
  const { data: psych } = await supabase
    .from('psychologists')
    .select('full_name, unvan, sehir, bio_text')
    .eq('booking_slug', slug)
    .single()

  if (!psych) return { title: 'Seansify' }

  const title = `${psych.unvan ? psych.unvan + ' ' : ''}${psych.full_name} — Psikolog${psych.sehir ? ', ' + psych.sehir : ''}`
  return {
    title,
    description: psych.bio_text?.slice(0, 160) ?? 'Seansify üzerinden randevu alın.',
  }
}

export default async function PsikologProfilPage({ params }: Context) {
  const { slug } = await params
  const supabase = getSupabase()

  const { data: psych } = await supabase
    .from('psychologists')
    .select(`
      id, full_name, booking_slug, unvan, sehir, bio_text,
      uzmanlik_alanlari, egitim, foto_url, klinik_adi, klinik_adres,
      klinik_tel, calisma_saatleri, profil_alinti, deneyim_yil, dil,
      session_duration_minutes, subscription_status, profil_gorunum,
      ilk_seans_metni
    `)
    .eq('booking_slug', slug)
    .single()

  if (!psych) notFound()

  if (!['active', 'trial'].includes(psych.subscription_status ?? '')) notFound()

  // Aktif seans paketleri
  const { data: paketler } = await supabase
    .from('paket_sablonlari')
    .select('id, name, session_count, price_tl')
    .eq('psychologist_id', psych.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Yayındaki bloglar
  const { data: bloglar } = await supabase
    .from('psikolog_bloglar')
    .select('id, baslik, slug, kategori, icerik, created_at')
    .eq('psychologist_id', psych.id)
    .eq('yayinda', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Onaylı yorumlar
  const { data: yorumlar } = await supabase
    .from('psikolog_yorumlar')
    .select('id, yildiz, yorum_metni, reviewer_init, dolduruldu_at')
    .eq('psychologist_id', psych.id)
    .eq('onaylandi', true)
    .order('dolduruldu_at', { ascending: false })
    .limit(5)

  // Tamamlanan seans sayısı
  const { count: tamamlananSeans } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('psychologist_id', psych.id)
    .eq('status', 'completed')

  return (
    <ProfilClient
      psych={psych}
      bloglar={bloglar ?? []}
      yorumlar={yorumlar ?? []}
      paketler={paketler ?? []}
      tamamlananSeans={tamamlananSeans ?? 0}
    />
  )
}
