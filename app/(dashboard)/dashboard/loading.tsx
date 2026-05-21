export default function DashboardLoading() {
  return (
    <div className="flex-1">
      <div className="h-16 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 border animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-lg mb-3" style={{ background: 'var(--muted)' }} />
              <div className="w-16 h-7 rounded mb-2" style={{ background: 'var(--muted)' }} />
              <div className="w-24 h-3 rounded" style={{ background: 'var(--muted)' }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 border animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl" style={{ background: 'var(--muted)' }} />
                <div className="w-28 h-4 rounded" style={{ background: 'var(--muted)' }} />
              </div>
              <div className="w-12 h-9 rounded mb-2" style={{ background: 'var(--muted)' }} />
              <div className="w-32 h-3 rounded" style={{ background: 'var(--muted)' }} />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border overflow-hidden animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="h-12 border-b" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }} />
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full shrink-0" style={{ background: 'var(--muted)' }} />
                <div className="flex-1">
                  <div className="w-32 h-3.5 rounded mb-1.5" style={{ background: 'var(--muted)' }} />
                  <div className="w-20 h-3 rounded" style={{ background: 'var(--muted)' }} />
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
