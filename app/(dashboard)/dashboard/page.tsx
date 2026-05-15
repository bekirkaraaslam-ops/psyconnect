import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import { formatDateTime, formatTime, appointmentStatusColor, appointmentStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, full_name, subscription_status, is_connected')
    .eq('auth_user_id', user!.id)
    .single()

  const psychologistId = psychologist?.id

  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString()

  const [
    { count: totalPatients },
    { count: todayCount },
    { count: weekCount },
    { data: upcomingAppointments },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).eq('is_active', true),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).gte('appointment_date', todayStart).lte('appointment_date', todayEnd),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).gte('appointment_date', now.toISOString()).lte('appointment_date', weekEnd).neq('status', 'canceled'),
    supabase.from('appointments').select('*, patient:patients(name_surname, phone_number)').eq('psychologist_id', psychologistId).gte('appointment_date', now.toISOString()).neq('status', 'canceled').order('appointment_date').limit(5),
  ])

  const stats = [
    { label: 'Toplam Hasta', value: totalPatients ?? 0, color: '#4a7c6f', icon: '👥' },
    { label: 'Bugünkü Randevular', value: todayCount ?? 0, color: '#3b82f6', icon: '📅' },
    { label: 'Bu Hafta', value: weekCount ?? 0, color: '#8b5cf6', icon: '🗓️' },
    { label: 'WA Durumu', value: psychologist?.is_connected ? 'Bağlı' : 'Bağlı Değil', color: psychologist?.is_connected ? '#16a34a' : '#dc2626', icon: '💬' },
  ]

  return (
    <div className="flex-1">
      <Topbar title="Genel Bakış" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#dde5e2' }}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl border" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#dde5e2' }}>
            <h2 className="font-semibold" style={{ color: '#334155' }}>Yaklaşan Randevular</h2>
            <Link href="/appointments" className="text-sm font-medium" style={{ color: '#4a7c6f' }}>
              Tümünü Gör →
            </Link>
          </div>

          {!upcomingAppointments || upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: '#94a3b8' }}>
              Yaklaşan randevu bulunmuyor.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {upcomingAppointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: '#4a7c6f' }}>
                      {apt.patient?.name_surname?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{formatDateTime(apt.appointment_date)}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                    {appointmentStatusLabel(apt.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/appointments/new" className="bg-white rounded-2xl p-5 border flex items-center gap-3 hover:shadow-sm transition-shadow" style={{ borderColor: '#dde5e2' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f1' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: '#334155' }}>Yeni Randevu</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>Hızlı ekle</div>
            </div>
          </Link>

          <Link href="/patients/new" className="bg-white rounded-2xl p-5 border flex items-center gap-3 hover:shadow-sm transition-shadow" style={{ borderColor: '#dde5e2' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: '#334155' }}>Yeni Hasta</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>Kayıt oluştur</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
