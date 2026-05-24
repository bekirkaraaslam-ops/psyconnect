import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import PatientCard from '@/components/patients/PatientCard'

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
          <div className="bg-white rounded-2xl border p-12 flex flex-col items-center text-center" style={{ borderColor: '#dde5e2' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="font-semibold mb-1" style={{ color: '#334155' }}>Henüz hasta kaydı yok</p>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>İlk hastanı ekleyerek randevu yönetimine başla.</p>
            <Link href="/patients/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#4a7c6f' }}>
              İlk Hastanı Ekle →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
