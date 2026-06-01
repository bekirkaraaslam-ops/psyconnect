import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import RaporlarClient from '@/components/raporlar/RaporlarClient'

export default async function RaporlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('plan_type')
    .eq('auth_user_id', user!.id)
    .single()

  const planType = psychologist?.plan_type ?? 'free'

  return (
    <div className="flex-1">
      <Topbar title="Raporlar" />
      <RaporlarClient planType={planType} />
    </div>
  )
}
