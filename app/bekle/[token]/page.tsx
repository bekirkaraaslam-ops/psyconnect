import { createClient } from '@/lib/supabase/server'
import WaitingListForm from './WaitingListForm'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ token: string }>
}

export default async function BeklePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('waiting_list')
    .select('psychologist_id, psychologists(full_name)')
    .eq('registration_token', token)
    .single()

  if (!entry) {
    // Token yoksa doğrudan token ile psikolog ara (ilk kayıt için token psikolog id'si)
    const { data: psych } = await supabase
      .from('psychologists')
      .select('id, full_name')
      .eq('id', token)
      .single()

    if (!psych) return notFound()

    return (
      <WaitingListForm
        psychologistId={psych.id}
        psychologistName={psych.full_name}
        registrationToken={null}
      />
    )
  }

  const psych = entry.psychologists as unknown as { full_name: string } | null

  return (
    <WaitingListForm
      psychologistId={entry.psychologist_id}
      psychologistName={psych?.full_name ?? 'Klinik'}
      registrationToken={token}
    />
  )
}
