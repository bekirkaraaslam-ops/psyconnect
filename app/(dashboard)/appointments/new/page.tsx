import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import AppointmentForm from '@/components/appointments/AppointmentForm'

export default async function NewAppointmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, name_surname, phone_number')
    .eq('psychologist_id', psychologist!.id)
    .eq('is_active', true)
    .order('name_surname')

  return (
    <div className="flex-1">
      <Topbar title="Yeni Randevu" />
      <div className="p-6 max-w-lg">
        <AppointmentForm patients={patients ?? []} />
      </div>
    </div>
  )
}
