import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import { formatDate, formatPhoneDisplay, getInitials } from '@/lib/utils'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('psychologist_id', psychologist!.id)
    .eq('is_active', true)
    .order('name_surname')

  return (
    <div className="flex-1">
      <Topbar title="Hastalar" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: '#64748b' }}>
            {patients?.length ?? 0} aktif hasta
          </p>
          <Link
            href="/patients/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: '#4a7c6f' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni Hasta
          </Link>
        </div>

        {!patients || patients.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#dde5e2' }}>
            <div className="text-4xl mb-3">👥</div>
            <p className="font-medium mb-1" style={{ color: '#334155' }}>Henüz hasta kaydı yok</p>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>İlk hastanızı ekleyerek başlayın.</p>
            <Link href="/patients/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#4a7c6f' }}>
              Hasta Ekle
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
            <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {patients.map(patient => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: '#4a7c6f' }}>
                      {getInitials(patient.name_surname)}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#334155' }}>{patient.name_surname}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{formatPhoneDisplay(patient.phone_number)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {patient.date_of_birth && (
                      <div className="text-xs" style={{ color: '#94a3b8' }}>{formatDate(patient.date_of_birth)}</div>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
