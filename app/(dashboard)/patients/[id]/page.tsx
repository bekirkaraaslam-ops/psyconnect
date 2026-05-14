import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import { formatDate, formatDateTime, formatPhoneDisplay, appointmentStatusColor, appointmentStatusLabel } from '@/lib/utils'
import { decrypt as decryptNote } from '@/lib/crypto'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', id)
    .order('appointment_date', { ascending: false })
    .limit(20)

  const decryptedNotes = patient.notes_encrypted
    ? (() => { try { return decryptNote(patient.notes_encrypted) } catch { return null } })()
    : null

  return (
    <div className="flex-1">
      <Topbar title={patient.name_surname} />

      <div className="p-6 space-y-5 max-w-2xl">
        {/* Patient Info Card */}
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white" style={{ background: '#4a7c6f' }}>
                {patient.name_surname.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: '#334155' }}>{patient.name_surname}</h2>
                <p className="text-sm" style={{ color: '#64748b' }}>{formatPhoneDisplay(patient.phone_number)}</p>
              </div>
            </div>
            <Link
              href={`/patients/${id}/edit`}
              className="text-sm px-3 py-1.5 rounded-lg border font-medium"
              style={{ borderColor: '#dde5e2', color: '#64748b' }}
            >
              Düzenle
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {patient.date_of_birth && (
              <div>
                <span style={{ color: '#94a3b8' }}>Doğum Tarihi</span>
                <p className="font-medium mt-0.5" style={{ color: '#334155' }}>{formatDate(patient.date_of_birth)}</p>
              </div>
            )}
            <div>
              <span style={{ color: '#94a3b8' }}>Kayıt Tarihi</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>{formatDate(patient.created_at)}</p>
            </div>
          </div>

          {decryptedNotes && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#f1f5f9' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>NOTLAR</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#334155' }}>{decryptedNotes}</p>
            </div>
          )}
        </div>

        {/* Appointment History */}
        <div className="bg-white rounded-2xl border" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#dde5e2' }}>
            <h3 className="font-semibold" style={{ color: '#334155' }}>Randevu Geçmişi</h3>
            <Link
              href={`/appointments/new?patient_id=${id}`}
              className="text-sm font-medium"
              style={{ color: '#4a7c6f' }}
            >
              + Randevu Ekle
            </Link>
          </div>

          {!appointments || appointments.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: '#94a3b8' }}>
              Henüz randevu kaydı yok.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {appointments.map((apt: any) => (
                <Link key={apt.id} href={`/appointments/${apt.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#334155' }}>{formatDateTime(apt.appointment_date)}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{apt.duration_minutes} dakika</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                    {appointmentStatusLabel(apt.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
