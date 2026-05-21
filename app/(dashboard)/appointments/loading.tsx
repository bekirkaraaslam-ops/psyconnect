export default function AppointmentsLoading() {
  return (
    <div className="flex-1">
      <div className="h-16 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-36 h-5 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
          <div className="w-32 h-9 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />
        </div>
        <div className="rounded-2xl border overflow-hidden animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="h-10 border-b px-5 flex items-center" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
            <div className="w-24 h-3.5 rounded" style={{ background: 'var(--border)' }} />
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full shrink-0" style={{ background: 'var(--muted)' }} />
                <div className="flex-1">
                  <div className="w-32 h-3.5 rounded mb-2" style={{ background: 'var(--muted)' }} />
                  <div className="w-24 h-3 rounded" style={{ background: 'var(--muted)' }} />
                </div>
                <div className="w-16 h-5 rounded-full" style={{ background: 'var(--muted)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
