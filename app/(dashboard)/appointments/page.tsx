import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel, getInitials } from '@/lib/utils'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patient:patients(name_surname, phone_number)')
    .eq('psychologist_id', psychologist!.id)
    .order('appointment_date', { ascending: false })
    .limit(50)

  const upcoming = appointments?.filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'canceled') ?? []
  const past = appointments?.filter(a => new Date(a.appointment_date) < new Date() || a.status === 'canceled') ?? []

  return (
    <div className="flex-1">
      <Topbar title="Randevular" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: '#64748b' }}>
            {upcoming.length} yaklaşan randevu
          </p>
          <Link
            href="/appointments/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: '#4a7c6f' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni Randevu
          </Link>
        </div>

        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#64748b' }}>YAKLAŞAN</h2>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
              <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                {upcoming.map((apt: any) => (
                  <AppointmentRow key={apt.id} apt={apt} />
                ))}
              </div>
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#64748b' }}>GEÇMİŞ</h2>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
              <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                {past.map((apt: any) => (
                  <AppointmentRow key={apt.id} apt={apt} />
                ))}
              </div>
            </div>
          </div>
        )}

        {(!appointments || appointments.length === 0) && (
          <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#dde5e2' }}>
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium mb-1" style={{ color: '#334155' }}>Randevu kaydı yok</p>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>İlk randevunuzu oluşturun.</p>
            <Link href="/appointments/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#4a7c6f' }}>
              Randevu Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function AppointmentRow({ apt }: { apt: any }) {
  return (
    <Link href={`/appointments/${apt.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: '#4a7c6f' }}>
          {getInitials(apt.patient?.name_surname ?? '?')}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
          <div className="text-xs" style={{ color: '#64748b' }}>{formatDateTime(apt.appointment_date)} · {apt.duration_minutes} dk</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {apt.reminder_sent && (
          <span className="text-xs" title="Hatırlatıcı gönderildi">💬</span>
        )}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
          {appointmentStatusLabel(apt.status)}
        </span>
      </div>
    </Link>
  )
}
