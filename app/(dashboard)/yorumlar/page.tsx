import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import YorumlarClient from './YorumlarClient'

export default async function YorumlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) redirect('/dashboard')

  const { data: yorumlar } = await supabase
    .from('psikolog_yorumlar')
    .select('id, yildiz, yorum_metni, reviewer_init, onaylandi, olusturuldu_at, dolduruldu_at')
    .eq('psychologist_id', psych.id)
    .order('olusturuldu_at', { ascending: false })

  return <YorumlarClient psychologistId={psych.id} yorumlar={yorumlar ?? []} />
}
