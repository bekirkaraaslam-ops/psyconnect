import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import YorumFormClient from './YorumFormClient'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Context {
  params: Promise<{ token: string }>
}

export default async function YorumPage({ params }: Context) {
  const { token } = await params
  const supabase = getSupabase()

  const { data: yorum } = await supabase
    .from('psikolog_yorumlar')
    .select('id, dolduruldu_at, psychologist_id, psychologists(full_name, unvan)')
    .eq('token', token)
    .single()

  if (!yorum) notFound()

  const psychRaw = yorum.psychologists as unknown
  const psych = (Array.isArray(psychRaw) ? psychRaw[0] : psychRaw) as { full_name: string; unvan: string | null } | null

  return (
    <YorumFormClient
      token={token}
      yorumId={yorum.id}
      alreadyFilled={!!yorum.dolduruldu_at}
      psychName={psych ? `${psych.unvan ? psych.unvan + ' ' : ''}${psych.full_name}` : 'Psikologunuz'}
    />
  )
}
