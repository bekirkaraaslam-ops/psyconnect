import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel, formatPhoneDisplay } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: apt } = await supabase
    .from('appointments')
    .select('*, patient:patients(id, name_surname, phone_number)')
    .eq('id', id)
    .single()

  if (!apt) notFound()

  return (
    <div className="flex-1">
      <Topbar title="Randevu Detayı" />

      <div className="p-6 max-w-lg space-y-5">
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-center justify-between">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
              {appointmentStatusLabel(apt.status)}
            </span>
            <Link href={`/appointments/${id}/edit`} className="text-sm px-3 py-1.5 rounded-lg border font-medium" style={{ borderColor: '#dde5e2', color: '#64748b' }}>
              Düzenle
            </Link>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>HASTA</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>
                <Link href={`/patients/${apt.patient?.id}`} className="hover:underline">{apt.patient?.name_surname}</Link>
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{formatPhoneDisplay(apt.patient?.phone_number ?? '')}</p>
            </div>

            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>TARİH & SAAT</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>{formatDateTime(apt.appointment_date)}</p>
            </div>

            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>SÜRE</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>{apt.duration_minutes} dakika</p>
            </div>

            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>HATIRLATICI</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>
                {apt.reminder_sent
                  ? `Gönderildi • ${formatDateTime(apt.reminder_sent_at)}`
                  : 'Henüz gönderilmedi'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
