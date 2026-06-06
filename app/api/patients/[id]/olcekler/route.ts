import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!psych) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: responses } = await supabase
    .from('scale_responses')
    .select('id, token, sent_at, filled_at, expires_at, total_score, interpretation, interpretation_color, scale:scales(slug, name, short_name)')
    .eq('patient_id', id)
    .eq('psychologist_id', psych.id)
    .order('sent_at', { ascending: false })

  return NextResponse.json({ responses: responses ?? [] })
}
