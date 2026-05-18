import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import SettingsForm from '@/components/settings/SettingsForm'
import ReferralPanel from '@/components/settings/ReferralPanel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, phone_number, subscription_status, subscription_ends_at, klinik_adresi, harita_linki, online_gorusme_linki, hosgeldiniz_mesaji')
    .eq('auth_user_id', user!.id)
    .single()

  return (
    <div className="flex-1">
      <Topbar title="Ayarlar" />
      <div className="p-6 max-w-lg space-y-6">
        <SettingsForm psychologist={psychologist ?? null} email={user?.email ?? ''} />

        {/* Abonelik bilgisi */}
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#334155' }}>Abonelik</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#334155' }}>
                {psychologist?.subscription_status === 'active' ? 'Aktif Plan' :
                 psychologist?.subscription_status === 'trial' ? 'Deneme Süresi' : 'Pasif'}
              </p>
              {psychologist?.subscription_ends_at && (
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Bitiş: {new Date(psychologist.subscription_ends_at).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              psychologist?.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
              psychologist?.subscription_status === 'trial' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-600'
            }`}>
              {psychologist?.subscription_status === 'active' ? 'Aktif' :
               psychologist?.subscription_status === 'trial' ? 'Deneme' : 'Pasif'}
            </span>
          </div>
        </div>

        {/* Referral paneli */}
        <ReferralPanel />

        {/* Sistem tanılama */}
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
