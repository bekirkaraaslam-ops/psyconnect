export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4F2' }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#4a7c6f' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0h10m-10 0a2 2 0 0 1-2 2H3m14-2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: '#334155' }}>Seansify</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Akıllı Klinik Yönetim Sistemi</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: '#dde5e2' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
