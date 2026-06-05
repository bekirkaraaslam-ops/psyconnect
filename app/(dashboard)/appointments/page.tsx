import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import UpcomingList from '@/components/appointments/UpcomingList'
import PastList from '@/components/appointments/PastList'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  const now = new Date()
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [{ data: appointments }, { data: weekApts }, { count: pendingCount }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, patient:patients(name_surname, phone_number)')
      .eq('psychologist_id', psychologist!.id)
      .order('appointment_date', { ascending: false })
      .limit(60),
    supabase
      .from('appointments')
      .select('status')
      .eq('psychologist_id', psychologist!.id)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', weekEnd.toISOString()),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', psychologist!.id)
      .eq('status', 'seansify_pending'),
  ])

  const canceledStatuses = ['canceled', 'cancelled_by_patient']
  const upcoming = appointments?.filter(a =>
    new Date(a.appointment_date) >= now && !canceledStatuses.includes(a.status)
  ) ?? []
  const past = appointments?.filter(a =>
    new Date(a.appointment_date) < now || canceledStatuses.includes(a.status)
  ) ?? []

  const weekTotal     = weekApts?.filter(a => !canceledStatuses.includes(a.status)).length ?? 0
  const weekConfirmed = weekApts?.filter(a => a.status === 'confirmed').length ?? 0
  const weekCompleted = weekApts?.filter(a => a.status === 'completed').length ?? 0
  const weekCanceled  = weekApts?.filter(a => canceledStatuses.includes(a.status)).length ?? 0

  const hasAny = appointments && appointments.length > 0

  return (
    <div className="flex-1">
      <Topbar title="Randevular" />

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">

        {/* Üst satır: başlık + buton */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {upcoming.length} yaklaşan randevu
          </p>
          <Link
            href="/appointments/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: '#4a7c6f' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni Randevu
          </Link>
        </div>

        {/* Bekleyen talep uyarısı */}
        {(pendingCount ?? 0) > 0 && (
          <Link
            href="/appointments"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-sm font-medium">{pendingCount} yeni randevu talebi bekliyor — onaylamak için tıklayın</span>
          </Link>
        )}

        {/* İstatistik kartları */}
        {hasAny && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Bu Hafta" value={weekTotal} sub="toplam randevu" bg="#eff6ff" valueColor="#2563eb" labelColor="#1e40af" />
            <StatCard label="Onaylandı" value={weekConfirmed} sub="bu hafta" bg="#f0fdf4" valueColor="#16a34a" labelColor="#166534" />
            <StatCard label="Tamamlandı" value={weekCompleted} sub="bu hafta" bg="#f8fafc" valueColor="#475569" labelColor="#64748b" />
            <StatCard label="İptal Edildi" value={weekCanceled} sub="bu hafta" bg="#fef2f2" valueColor="#dc2626" labelColor="#991b1b" />
          </div>
        )}

        {/* Yan yana listeler */}
        {hasAny ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Yaklaşan */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 text-slate-500 dark:text-slate-300">
                Yaklaşan
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold" style={{ background: '#4a7c6f' }}>
                  {upcoming.length}
                </span>
              </h2>
              <UpcomingList appointments={upcoming} />
            </div>

            {/* Geçmiş */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 text-slate-500 dark:text-slate-300">
                Geçmiş
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold" style={{ background: '#e2e8f0', color: '#64748b' }}>
                  {past.length}
                </span>
              </h2>
              <PastList appointments={past} />
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-12 flex flex-col items-center text-center" style={{ borderColor: '#dde5e2' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="16" y1="14" x2="16" y2="14" />
            </svg>
            <p className="font-semibold mb-1" style={{ color: '#334155' }}>Henüz randevu yok</p>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>İlk randevunuzu oluşturarak hasta takibine başlayın.</p>
            <Link href="/appointments/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#4a7c6f' }}>
              İlk Randevunu Ekle →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

const BG_CLASS: Record<string, string> = {
  '#eff6ff': 'bg-[#eff6ff] dark:bg-blue-950/50',
  '#f0fdf4': 'bg-[#f0fdf4] dark:bg-green-950/50',
  '#f8fafc': 'bg-[#f8fafc] dark:bg-slate-800/60',
  '#fef2f2': 'bg-[#fef2f2] dark:bg-red-950/50',
}

function StatCard({ label, value, sub, bg, valueColor, labelColor }: {
  label: string; value: number; sub: string
  bg: string; valueColor: string; labelColor: string
}) {
  return (
    <div className={`rounded-2xl p-5 ${BG_CLASS[bg] ?? `bg-[${bg}]`}`}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: labelColor }}>{label}</p>
      <p className="text-4xl font-bold leading-none" style={{ color: valueColor }}>{value}</p>
      <p className="text-xs mt-2" style={{ color: labelColor, opacity: 0.7 }}>{sub}</p>
    </div>
  )
}

