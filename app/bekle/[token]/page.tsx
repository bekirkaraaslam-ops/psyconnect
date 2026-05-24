import { createClient } from '@supabase/supabase-js'
import WaitingListForm from './WaitingListForm'
import { notFound } from 'next/navigation'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Props {
  params: Promise<{ token: string }>
}

export default async function BeklePage({ params }: Props) {
  const { token } = await params
  const supabase = getSupabase()

  // booking_slug ile ara (kısa link desteği)
  const { data: psychBySlug } = await supabase
    .from('psychologists')
    .select('id, full_name')
    .eq('booking_slug', token)
    .maybeSingle()

  if (psychBySlug) {
    return (
      <WaitingListForm
        psychologistId={psychBySlug.id}
        psychologistName={psychBySlug.full_name}
        registrationToken={null}
      />
    )
  }

  // UUID ile ara
  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name')
    .eq('id', token)
    .maybeSingle()

  if (!psych) return notFound()

  return (
    <WaitingListForm
      psychologistId={psych.id}
      psychologistName={psych.full_name}
      registrationToken={null}
    />
  )
}
