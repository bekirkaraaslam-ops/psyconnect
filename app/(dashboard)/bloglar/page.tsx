import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BloglarClient from './BloglarClient'

export default async function BloglarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, booking_slug')
    .eq('auth_user_id', user.id)
    .single()

  if (!psych) redirect('/dashboard')

  const { data: bloglar } = await supabase
    .from('psikolog_bloglar')
    .select('id, baslik, slug, kategori, yayinda, created_at, icerik, kapak_url')
    .eq('psychologist_id', psych.id)
    .order('created_at', { ascending: false })

  return <BloglarClient psychologistId={psych.id} bookingSlug={psych.booking_slug} bloglar={bloglar ?? []} />
}
