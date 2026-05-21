export default function PatientsLoading() {
  return (
    <div className="flex-1">
      <div className="h-16 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-32 h-5 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
          <div className="w-28 h-9 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl p-4 border flex items-center gap-4 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full shrink-0" style={{ background: 'var(--muted)' }} />
              <div className="flex-1">
                <div className="w-36 h-4 rounded mb-2" style={{ background: 'var(--muted)' }} />
                <div className="w-28 h-3 rounded" style={{ background: 'var(--muted)' }} />
              </div>
              <div className="w-20 h-3 rounded" style={{ background: 'var(--muted)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
