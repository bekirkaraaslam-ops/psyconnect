import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import AppointmentForm from '@/components/appointments/AppointmentForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAppointmentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  const [{ data: apt }, { data: patients }] = await Promise.all([
    supabase.from('appointments').select('*').eq('id', id).single(),
    supabase.from('patients').select('id, name_surname, phone_number').eq('psychologist_id', psychologist!.id).eq('is_active', true).order('name_surname'),
  ])

  if (!apt) notFound()

  return (
    <div className="flex-1">
      <Topbar title="Randevu Düzenle" />
      <div className="p-6 max-w-lg">
        <AppointmentForm patients={patients ?? []} appointment={apt} />
      </div>
    </div>
  )
}
