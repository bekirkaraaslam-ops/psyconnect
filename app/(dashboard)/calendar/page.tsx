import Topbar from '@/components/layout/Topbar'
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar'
import SeansifyPendingPanel from '@/components/calendar/SeansifyPendingPanel'

export default function CalendarPage() {
  return (
    <div className="flex-1">
      <Topbar title="Takvim" />

      <div className="p-2 md:p-6">
        <SeansifyPendingPanel />
        <AppointmentCalendar />
      </div>
    </div>
  )
}
