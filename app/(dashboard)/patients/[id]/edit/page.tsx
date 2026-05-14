import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import PatientForm from '@/components/patients/PatientForm'
import { decrypt } from '@/lib/crypto'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  const decryptedNotes = patient.notes_encrypted
    ? (() => { try { return decrypt(patient.notes_encrypted) } catch { return '' } })()
    : ''

  return (
    <div className="flex-1">
      <Topbar title="Hasta Düzenle" />
      <div className="p-6 max-w-lg">
        <PatientForm
          patient={{
            id: patient.id,
            name_surname: patient.name_surname,
            phone_number: patient.phone_number,
            date_of_birth: patient.date_of_birth,
            notes: decryptedNotes,
          }}
        />
      </div>
    </div>
  )
}
