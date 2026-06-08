export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {children}
    </div>
  )
}
