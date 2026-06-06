import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import { formatDate, formatPhoneDisplay } from '@/lib/utils'
import { decrypt as decryptNote } from '@/lib/crypto'
import PatientDetailTabs from '@/components/patients/PatientDetailTabs'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  if (!psychologist) notFound()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!patient) notFound()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, duration_minutes, status')
    .eq('patient_id', id)
    .eq('psychologist_id', psychologist.id)
    .order('appointment_date', { ascending: false })
    .limit(50)

  const { data: anamnezForm } = await supabase
    .from('anamnez_forms')
    .select('id, filled_at, expires_at, sikayet_encrypted, sure_encrypted, gecmis_tedavi_encrypted, ilac_kullanim_encrypted, aile_gecmis_encrypted, uyku_durum_encrypted, beslenme_durum_encrypted, acil_kisi_encrypted, ek_notlar_encrypted')
    .eq('patient_id', id)
    .eq('psychologist_id', psychologist.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: onamForm } = await supabase
    .from('onam_formlar')
    .select('id, filled_at, expires_at, imza_text')
    .eq('patient_id', id)
    .eq('psychologist_id', psychologist.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const decryptedNotes = patient.notes_encrypted
    ? (() => { try { return decryptNote(patient.notes_encrypted) } catch { return null } })()
    : null

  return (
    <div className="flex-1">
      <Topbar title={patient.name_surname} />

      <div className="p-3 md:p-6 space-y-4 max-w-4xl">
        {/* Hasta bilgi kartı — her zaman görünür */}
        <div className="bg-white rounded-2xl border p-4 md:p-5" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white shrink-0" style={{ background: '#4a7c6f' }}>
                {patient.name_surname.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold truncate" style={{ color: '#334155' }}>{patient.name_surname}</h2>
                <p className="text-sm" style={{ color: '#64748b' }}>{formatPhoneDisplay(patient.phone_number)}</p>
              </div>
            </div>
            <Link
              href={`/patients/${id}/edit`}
              className="text-sm px-3 py-1.5 rounded-lg border font-medium shrink-0"
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

        {/* Sekmeli içerik */}
        <PatientDetailTabs
          hastaId={id}
          hastaAdi={patient.name_surname}
          appointments={appointments ?? []}
          anamnezForm={anamnezForm ?? null}
          onamForm={onamForm ?? null}
          anamnezEnabled={!!patient.anamnez_enabled}
        />
      </div>
    </div>
  )
}
