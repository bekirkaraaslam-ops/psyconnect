import { createClient } from '@supabase/supabase-js'
import BookingClient from './BookingClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function TatilScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f4faf8' }}>
      <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fef3c7' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: '#334155' }}>
          Şu an randevu alınamıyor
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
          Psikolog şu an izinde ya da tatilde olduğundan yeni randevu talebi kabul edilmemektedir.
        </p>
        <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
          Daha sonra tekrar deneyiniz veya doğrudan iletişime geçiniz.
        </p>
      </div>
    </div>
  )
}

function NotFoundScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4faf8' }}>
      <div className="text-center p-8">
        <p className="text-sm" style={{ color: '#64748b' }}>Bu randevu sayfası bulunamadı.</p>
      </div>
    </div>
  )
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params
  const supabase = getSupabase()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name, tatil_modu, work_days, work_start_hour, work_end_hour, session_duration_minutes, buffer_minutes')
    .eq('booking_slug', slug)
    .maybeSingle()

  if (!psych) return <NotFoundScreen />

  if (psych.tatil_modu) return <TatilScreen />

  const now = new Date()
  const future = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)

  const { data: booked } = await supabase
    .from('appointments')
    .select('appointment_date')
    .eq('psychologist_id', psych.id)
    .gte('appointment_date', now.toISOString())
    .lte('appointment_date', future.toISOString())
    .not('status', 'in', '("canceled","cancelled_by_patient")')

  const bookedSlots = (booked ?? []).map((a: { appointment_date: string }) => a.appointment_date)

  return <BookingClient slug={slug} psych={psych} bookedSlots={bookedSlots} />
}
