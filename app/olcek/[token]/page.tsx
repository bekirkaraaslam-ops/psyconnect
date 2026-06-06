import { createClient } from '@supabase/supabase-js'
import OlcekFormClient from './OlcekFormClient'

interface Props {
  params: Promise<{ token: string }>
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function ErrorPage({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
      <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
        <p className="text-sm font-medium" style={{ color: '#334155' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{sub}</p>
      </div>
    </div>
  )
}

export default async function OlcekPage({ params }: Props) {
  const { token } = await params
  const supabase = getSupabase()

  const { data: response } = await supabase
    .from('scale_responses')
    .select('id, expires_at, filled_at, scale:scales(slug, name, short_name, instructions, questions, scoring_rules), patient:patients(name_surname)')
    .eq('token', token)
    .maybeSingle()

  if (!response) {
    return <ErrorPage title="Bu link geçersiz." sub="Lütfen psikoloğunuzla iletişime geçin." />
  }
  if (new Date(response.expires_at) < new Date()) {
    return <ErrorPage title="Bu linkin süresi dolmuş." sub="Lütfen psikoloğunuzla iletişime geçin." />
  }
  if (response.filled_at) {
    return <ErrorPage title="Bu form daha önce doldurulmuş." sub="Teşekkür ederiz!" />
  }

  const scale = response.scale as any
  const patientName = (response.patient as any)?.name_surname ?? ''

  return (
    <OlcekFormClient
      token={token}
      patientName={patientName}
      scaleName={scale.name}
      scaleSlug={scale.slug}
      instructions={scale.instructions}
      questions={scale.questions}
      scoringRules={scale.scoring_rules}
    />
  )
}
