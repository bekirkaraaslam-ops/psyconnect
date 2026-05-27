import Topbar from '@/components/layout/Topbar'
import RaporlarClient from '@/components/raporlar/RaporlarClient'

export default function RaporlarPage() {
  return (
    <div className="flex-1">
      <Topbar title="Raporlar" />
      <RaporlarClient />
    </div>
  )
}
