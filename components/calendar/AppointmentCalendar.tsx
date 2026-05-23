'use client'

import { useCallback, useEffect, useRef } from 'react'
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

  useEffect(() => {
    const handler = () => calendarRef.current?.getApi().refetchEvents()
    window.addEventListener('calendar:refresh', handler)
    return () => window.removeEventListener('calendar:refresh', handler)
  }, [])

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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="bg-white rounded-2xl border p-2 sm:p-4" style={{ borderColor: '#dde5e2' }}>
      <div className="mb-3 flex flex-wrap gap-2 sm:gap-3 text-xs font-medium px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#16a34a' }} />
          Onaylandı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#4a7c6f' }} />
          Bekliyor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#dc2626' }} />
          İptal Edildi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#94a3b8' }} />
          Tamamlandı
        </span>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-0">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
            locale={trLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth',
            }}
            views={{
              timeGridWeek: { buttonText: 'Hafta' },
              timeGridDay: { buttonText: 'Gün' },
              dayGridMonth: { buttonText: 'Ay' },
            }}
            events={fetchEvents}
            eventClick={handleEventClick}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            nowIndicator
            height="auto"
            eventDisplay="block"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            buttonText={{
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
            }}
          />
        </div>
      </div>
    </div>
  )
}
