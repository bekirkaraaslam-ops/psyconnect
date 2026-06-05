import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import PatientForm from '@/components/patients/PatientForm'
import { getLimits, isProPlan } from '@/lib/plans'

export default async function NewPatientPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, plan_type')
    .eq('auth_user_id', user!.id)
    .single()

  if (psychologist && !isProPlan(psychologist.plan_type)) {
    const limits = getLimits(psychologist.plan_type)
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', psychologist.id)
      .eq('is_active', true)
    if ((count ?? 0) >= limits.maxActivePatients) {
      redirect('/patients?limit=patients')
    }
  }

  return (
    <div className="flex-1">
      <Topbar title="Yeni Hasta" />
      <div className="p-3 md:p-6 max-w-lg">
        <PatientForm />
      </div>
    </div>
  )
}
