import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import PendingApprovalsPanel from '@/components/dashboard/PendingApprovalsPanel'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { startOfDay, endOfDay, endOfWeek, startOfWeek, addDays } from 'date-fns'

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
  const tomorrowStart = startOfDay(addDays(now, 1)).toISOString()
  const tomorrowEnd = endOfDay(addDays(now, 1)).toISOString()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString()

  const [
    { count: totalPatients },
    { count: todayCount },
    { count: weekCount },
    { data: pendingBotApts },
    { count: waitingListCount },
    { data: unfilledAnamnez },
    { count: canceledCount },
    { count: cascadeOfferedCount },
    { data: todayTimeline },
    { data: tomorrowTimeline },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).eq('is_active', true),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).gte('appointment_date', todayStart).lte('appointment_date', todayEnd),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).gte('appointment_date', now.toISOString()).lte('appointment_date', weekEnd).neq('status', 'canceled'),
    supabase.from('appointments').select('id, appointment_date, duration_minutes, patient:patients(name_surname, phone_number)').eq('psychologist_id', psychologistId).eq('status', 'seansify_pending').order('appointment_date'),
    supabase.from('waiting_list').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).in('status', ['waiting', 'offered']),
    supabase.from('anamnez_forms').select('id, expires_at, created_at, patient:patients(name_surname)').eq('psychologist_id', psychologistId).is('filled_at', null).order('created_at', { ascending: false }).limit(5),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).in('status', ['canceled', 'cancelled_by_patient']).gte('updated_at', weekStart).lte('updated_at', weekEnd),
    supabase.from('waiting_list').select('*', { count: 'exact', head: true }).eq('psychologist_id', psychologistId).not('offer_sent_at', 'is', null).gte('offer_sent_at', weekStart).lte('offer_sent_at', weekEnd),
    supabase.from('appointments').select('*, patient:patients(name_surname)').eq('psychologist_id', psychologistId).gte('appointment_date', todayStart).lte('appointment_date', todayEnd).in('status', ['waiting', 'confirmed']).order('appointment_date'),
    supabase.from('appointments').select('*, patient:patients(name_surname)').eq('psychologist_id', psychologistId).gte('appointment_date', tomorrowStart).lte('appointment_date', tomorrowEnd).in('status', ['waiting', 'confirmed']).order('appointment_date'),
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
            <div key={stat.label} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Onay Bekleyen Randevular */}
        <PendingApprovalsPanel initialItems={(pendingBotApts ?? []) as any} />

        {/* 3 bilgi paneli */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

          {/* Bekleme Listesi */}
          <Link href="/waiting-list" className="bg-white rounded-2xl p-5 hover:shadow-md transition-shadow block" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
                <span style={{ fontSize: 18 }}>🕐</span>
              </div>
              <div className="text-sm font-semibold" style={{ color: '#334155' }}>Bekleme Listesi</div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#3b82f6' }}>
              {waitingListCount ?? 0}
            </div>
            <div className="text-xs" style={{ color: '#64748b' }}>
              {(waitingListCount ?? 0) === 0 ? 'Bekleme listesi boş' : 'kişi randevu bekliyor'}
            </div>
            <div className="mt-3 text-xs font-medium" style={{ color: '#3b82f6' }}>Listeyi gör →</div>
          </Link>

          {/* Doldurulmamış Anamnez Formları */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#faf5ff' }}>
                <span style={{ fontSize: 18 }}>📋</span>
              </div>
              <div className="text-sm font-semibold" style={{ color: '#334155' }}>Bekleyen Anamnez</div>
            </div>
            {!unfilledAnamnez || unfilledAnamnez.length === 0 ? (
              <div className="text-sm" style={{ color: '#94a3b8' }}>Tüm formlar doldurulmuş ✓</div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold mb-1" style={{ color: '#8b5cf6' }}>
                  {unfilledAnamnez.length}
                </div>
                <div className="text-xs mb-2" style={{ color: '#64748b' }}>form henüz doldurulmadı</div>
                {unfilledAnamnez.slice(0, 3).map((form: any) => (
                  <div key={form.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#8b5cf6' }} />
                    <span className="text-xs truncate" style={{ color: '#475569' }}>
                      {form.patient?.name_surname ?? 'Hasta'}
                    </span>
                  </div>
                ))}
                {unfilledAnamnez.length > 3 && (
                  <div className="text-xs" style={{ color: '#94a3b8' }}>+{unfilledAnamnez.length - 3} kişi daha</div>
                )}
              </div>
            )}
          </div>

          {/* Bu Haftaki İptaller */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fff1f2' }}>
                <span style={{ fontSize: 18 }}>📊</span>
              </div>
              <div className="text-sm font-semibold" style={{ color: '#334155' }}>Bu Haftaki İptaller</div>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-3xl font-bold" style={{ color: '#dc2626' }}>
                  {canceledCount ?? 0}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>iptal edildi</div>
              </div>
              {(canceledCount ?? 0) > 0 && (
                <>
                  <div className="text-lg font-light mb-1" style={{ color: '#cbd5e1' }}>/</div>
                  <div>
                    <div className="text-3xl font-bold" style={{ color: '#16a34a' }}>
                      {cascadeOfferedCount ?? 0}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>yeri dolduruldu</div>
                  </div>
                </>
              )}
            </div>
            {(canceledCount ?? 0) === 0 && (
              <div className="text-xs mt-2" style={{ color: '#94a3b8' }}>Bu hafta iptal yok ✓</div>
            )}
          </div>

        </div>

        {/* Bugün / Yarın Timeline */}
        <DayTimeline todayApts={todayTimeline ?? []} tomorrowApts={tomorrowTimeline ?? []} />

      </div>
    </div>
  )
}

function DayTimeline({ todayApts, tomorrowApts }: { todayApts: any[]; tomorrowApts: any[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex border-b" style={{ borderColor: '#dde5e2' }}>
        <div className="flex-1 px-5 py-3 text-sm font-semibold flex items-center gap-2" style={{ color: '#334155', borderRight: '1px solid #dde5e2' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#4a7c6f' }} />
          Bugün
          <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: '#e8f5f1', color: '#4a7c6f' }}>
            {todayApts.length} seans
          </span>
        </div>
        <div className="flex-1 px-5 py-3 text-sm font-semibold flex items-center gap-2" style={{ color: '#334155' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3b82f6' }} />
          Yarın
          <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            {tomorrowApts.length} seans
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="divide-y sm:border-r" style={{ borderColor: '#f1f5f9' }}>
          {todayApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Bugün randevu yok</p>
            </div>
          ) : (
            todayApts.map((apt: any) => <TimelineRow key={apt.id} apt={apt} />)
          )}
        </div>
        <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
          {tomorrowApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Yarın randevu yok</p>
            </div>
          ) : (
            tomorrowApts.map((apt: any) => <TimelineRow key={apt.id} apt={apt} />)
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ apt }: { apt: any }) {
  const saat = new Date(apt.appointment_date).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'
  })
  const isOnline = apt.appointment_type === 'online'
  const isConfirmed = apt.status === 'confirmed'

  return (
    <Link href={`/appointments/${apt.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="text-xs font-mono font-semibold w-11 shrink-0 text-right" style={{ color: '#4a7c6f' }}>{saat}</div>
      <div className="w-px h-8 shrink-0" style={{ background: '#e2e8f0' }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs" style={{ color: '#94a3b8' }}>{isOnline ? '💻 Online' : '🏢 Yüz yüze'}</span>
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${isConfirmed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
        {isConfirmed ? 'Onaylı' : 'Bekliyor'}
      </span>
    </Link>
  )
}
