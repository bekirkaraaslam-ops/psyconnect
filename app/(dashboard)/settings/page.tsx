import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import SettingsForm from '@/components/settings/SettingsForm'
import ReferralPanel from '@/components/settings/ReferralPanel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, phone_number, subscription_status, subscription_ends_at, klinik_adresi, harita_linki, online_gorusme_linki, hosgeldiniz_mesaji, work_start_hour, work_end_hour, work_days, session_duration_minutes, buffer_minutes, booking_slug')
    .eq('auth_user_id', user!.id)
    .single()

  return (
    <div className="flex-1">
      <Topbar title="Ayarlar" />
      <div className="p-6 space-y-5 max-w-5xl">
        <SettingsForm
          psychologist={psychologist ?? null}
          email={user?.email ?? ''}
          subscriptionStatus={psychologist?.subscription_status ?? null}
          subscriptionEndsAt={psychologist?.subscription_ends_at ?? null}
        />

        <ReferralPanel />

        <div className="flex justify-end">
          <a
            href="/api/diagnose"
            target="_blank"
            className="text-xs underline"
            style={{ color: '#64748b' }}
          >
            Sistem durumunu kontrol et →
          </a>
        </div>
      </div>
    </div>
  )
}
