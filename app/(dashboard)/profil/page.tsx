import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilEditor from './ProfilEditor'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: psych } = await supabase
    .from('psychologists')
    .select(`
      id, full_name, booking_slug, unvan, sehir, bio_text,
      uzmanlik_alanlari, egitim, foto_url, klinik_adi, klinik_adres,
      klinik_tel, calisma_saatleri, profil_alinti, deneyim_yil, dil,
      work_start_hour, work_end_hour, work_days, session_duration_minutes,
      subscription_status, profil_gorunum, ilk_seans_metni
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) redirect('/dashboard')

  const { data: paketler } = await supabase
    .from('paket_sablonlari')
    .select('id, name, session_count, price_tl, is_active')
    .eq('psychologist_id', psych.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return <ProfilEditor psych={psych} paketler={paketler ?? []} subscriptionStatus={psych.subscription_status ?? null} />
}
