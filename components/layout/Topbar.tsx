import { createClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'

interface TopbarProps {
  title: string
}

export default async function Topbar({ title }: TopbarProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('full_name, is_connected')
    .single()

  const name = psychologist?.full_name ?? user?.email ?? ''
  const initials = getInitials(name)

  return (
    <header className="h-16 border-b flex items-center justify-between px-6" style={{ background: '#ffffff', borderColor: '#dde5e2' }}>
      <h1 className="text-lg font-semibold" style={{ color: '#334155' }}>{title}</h1>

      <div className="flex items-center gap-3">
        {/* WhatsApp status indicator */}
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{
          background: psychologist?.is_connected ? '#dcfce7' : '#f1f5f9',
          color: psychologist?.is_connected ? '#16a34a' : '#94a3b8'
        }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: psychologist?.is_connected ? '#16a34a' : '#cbd5e1' }} />
          {psychologist?.is_connected ? 'WA Bağlı' : 'WA Bağlı Değil'}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: '#4a7c6f' }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
