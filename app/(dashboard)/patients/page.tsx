import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import PatientsSearchList from '@/components/patients/PatientsSearchList'
import { getLimits, isProPlan } from '@/lib/plans'
import PatientsLimitButton from '@/components/patients/PatientsLimitButton'
import { Suspense } from 'react'
import PatientsLimitAlert from '@/components/patients/PatientsLimitAlert'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, plan_type')
    .eq('auth_user_id', user!.id)
    .single()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('psychologist_id', psychologist!.id)
    .eq('is_active', true)
    .order('name_surname')

  const planType = psychologist?.plan_type ?? 'free'
  const isPro = isProPlan(planType)
  const limits = getLimits(planType)
  const patientCount = patients?.length ?? 0
  const atLimit = !isPro && patientCount >= limits.maxActivePatients

  return (
    <div className="flex-1">
      <Topbar title="Danışanlar" />
      <Suspense fallback={null}><PatientsLimitAlert /></Suspense>

      <div className="p-3 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {patientCount} aktif danışan
            </p>
            {!isPro && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((patientCount / limits.maxActivePatients) * 100, 100)}%`,
                      background: atLimit ? '#ef4444' : '#4a7c6f',
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: atLimit ? '#ef4444' : '#94a3b8' }}>
                  {patientCount} / {limits.maxActivePatients}
                </span>
              </div>
            )}
          </div>

          {atLimit ? (
            <PatientsLimitButton />
          ) : (
            <Link
              href="/patients/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: '#4a7c6f' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Yeni Danışan
            </Link>
          )}
        </div>

        {!patients || patients.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 flex flex-col items-center text-center" style={{ borderColor: '#dde5e2' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="font-semibold mb-1" style={{ color: '#334155' }}>Henüz danışan kaydı yok</p>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>İlk danışanını ekleyerek randevu yönetimine başla.</p>
            <Link href="/patients/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#4a7c6f' }}>
              İlk Danışanını Ekle →
            </Link>
          </div>
        ) : (
          <PatientsSearchList patients={patients} />
        )}
      </div>
    </div>
  )
}
