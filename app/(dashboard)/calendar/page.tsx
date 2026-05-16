import Topbar from '@/components/layout/Topbar'
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar'
import PsyconnectPendingPanel from '@/components/calendar/PsyconnectPendingPanel'

export default function CalendarPage() {
  return (
    <div className="flex-1">
      <Topbar title="Takvim" />

      <div className="p-6">
        <PsyconnectPendingPanel />
        <AppointmentCalendar />
      </div>
    </div>
  )
}
