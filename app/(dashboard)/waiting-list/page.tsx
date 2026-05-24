import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import WaitingListPanel from '@/components/waiting-list/WaitingListPanel'

export default async function WaitingListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, booking_slug')
    .eq('auth_user_id', user!.id)
    .single()

  const { data: entries } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('psychologist_id', psychologist!.id)
    .in('status', ['waiting', 'offered'])
    .order('created_at')

  return (
    <div className="flex-1">
      <Topbar title="Bekleme Listesi" />
      <div className="p-6 max-w-2xl">
        <WaitingListPanel
          initialEntries={entries ?? []}
          psychologistId={psychologist!.id}
          bookingSlug={psychologist!.booking_slug ?? undefined}
        />
      </div>
    </div>
  )
}
