import { createClient } from '@supabase/supabase-js'
import AnamnezFormClient from './AnamnezFormClient'

interface Props {
  params: Promise<{ token: string }>
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AnamnezPage({ params }: Props) {
  const { token } = await params
  const supabase = getSupabase()

  const { data: form } = await supabase
    .from('anamnez_forms')
    .select('id, expires_at, filled_at, patient:patients(name_surname)')
    .eq('token', token)
    .maybeSingle()

  // Token bulunamadı
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <p className="text-sm font-medium" style={{ color: '#334155' }}>Bu link geçersiz.</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Lütfen psikoloğunuzla iletişime geçin.</p>
        </div>
      </div>
    )
  }

  // Süresi dolmuş
  if (new Date(form.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <p className="text-sm font-medium" style={{ color: '#334155' }}>Bu linkin süresi dolmuş.</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Lütfen psikoloğunuzla iletişime geçin.</p>
        </div>
      </div>
    )
  }

  // Zaten doldurulmuş
  if (form.filled_at) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <p className="text-sm font-medium" style={{ color: '#334155' }}>Bu form daha önce doldurulmuş.</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Teşekkür ederiz!</p>
        </div>
      </div>
    )
  }

  const patientName = (form.patient as any)?.name_surname ?? ''

  return <AnamnezFormClient token={token} patientName={patientName} />
}
