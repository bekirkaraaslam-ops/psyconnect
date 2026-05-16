'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventSourceFuncArg } from '@fullcalendar/core'
import trLocale from '@fullcalendar/core/locales/tr'

export default function AppointmentCalendar() {
  const router = useRouter()
  const calendarRef = useRef<FullCalendar>(null)

  const fetchEvents = useCallback(async (info: EventSourceFuncArg) => {
    const params = new URLSearchParams({
      start: info.startStr,
      end: info.endStr,
    })
    const res = await fetch(`/api/appointments/calendar?${params}`)
    if (!res.ok) return []
    return res.json()
  }, [])

  function handleEventClick(arg: EventClickArg) {
    router.push(`/appointments/${arg.event.id}`)
  }

  return (
    <div className="bg-white rounded-2xl border p-4" style={{ borderColor: '#dde5e2' }}>
      <div className="mb-4 flex flex-wrap gap-3 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#16a34a' }} />
          Onaylandı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#4a7c6f' }} />
          Bekliyor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#dc2626' }} />
          İptal Edildi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#94a3b8' }} />
          Tamamlandı
        </span>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={trLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={fetchEvents}
        eventClick={handleEventClick}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
        height="auto"
        eventDisplay="block"
        eventCursor="pointer"
        buttonText={{
          today: 'Bugün',
          month: 'Ay',
          week: 'Hafta',
          day: 'Gün',
        }}
      />
    </div>
  )
}
