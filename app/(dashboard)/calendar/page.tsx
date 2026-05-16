import Topbar from '@/components/layout/Topbar'
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar'

export default function CalendarPage() {
  return (
    <div className="flex-1">
      <Topbar title="Takvim" />

      <div className="p-6">
        <AppointmentCalendar />
      </div>
    </div>
  )
}
