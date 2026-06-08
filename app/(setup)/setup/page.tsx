import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SetupWizard from '@/components/setup/SetupWizard'

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name, phone_number, varsayilan_seans_ucreti, onboarding_completed')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) redirect('/login')
  if (psych.onboarding_completed) redirect('/dashboard')

  return (
    <SetupWizard
      psychologistId={psych.id}
      initialName={psych.full_name ?? ''}
      initialPhone={psych.phone_number ?? ''}
      initialUcret={psych.varsayilan_seans_ucreti ?? null}
    />
  )
}
