import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel, formatPhoneDisplay } from '@/lib/utils'
import ManuelHatirlaticiButton from '@/components/appointments/ManuelHatirlaticiButton'
import { decrypt } from '@/lib/crypto'

interface Props {
  params: Promise<{ id: string }>
}

function safeDecrypt(val: string | null | undefined): string {
  if (!val) return ''
  try { return decrypt(val) } catch { return '' }
}

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single()

  if (!psychologist) notFound()

  const { data: apt } = await supabase
    .from('appointments')
    .select('*, patient:patients(id, name_surname, phone_number)')
    .eq('id', id)
    .eq('psychologist_id', psychologist.id)
    .single()

  if (!apt) notFound()

  // Hastanın en son SOAP notunu getir (hap bilgi)
  const { data: lastNote } = await supabase
    .from('hasta_notlari')
    .select('seans_tarihi, soap_s_encrypted, soap_o_encrypted, soap_a_encrypted, soap_p_encrypted, seans_notu_encrypted')
    .eq('psychologist_id', psychologist.id)
    .eq('hasta_id', apt.patient?.id)
    .order('seans_tarihi', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hapBilgi = lastNote ? {
    tarih: lastNote.seans_tarihi,
    s: safeDecrypt(lastNote.soap_s_encrypted),
    o: safeDecrypt(lastNote.soap_o_encrypted),
    a: safeDecrypt(lastNote.soap_a_encrypted),
    p: safeDecrypt(lastNote.soap_p_encrypted),
    genel: safeDecrypt(lastNote.seans_notu_encrypted),
  } : null

  const hasHapBilgi = hapBilgi && (hapBilgi.s || hapBilgi.o || hapBilgi.a || hapBilgi.p || hapBilgi.genel)

  return (
    <div className="flex-1">
      <Topbar title="Randevu Detayı" />

      <div className="p-3 md:p-6 max-w-2xl space-y-5">
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-center justify-between">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
              {appointmentStatusLabel(apt.status)}
            </span>
            <Link href={`/appointments/${id}/edit`} className="text-sm px-3 py-1.5 rounded-lg border font-medium" style={{ borderColor: '#dde5e2', color: '#64748b' }}>
              Düzenle
            </Link>
          </div>

          <ManuelHatirlaticiButton appointmentId={apt.id} />

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>HASTA</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>
                <Link href={`/patients/${apt.patient?.id}`} className="hover:underline">{apt.patient?.name_surname}</Link>
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{formatPhoneDisplay(apt.patient?.phone_number ?? '')}</p>
            </div>

            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>TARİH & SAAT</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>{formatDateTime(apt.appointment_date)}</p>
            </div>

            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>SÜRE</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>{apt.duration_minutes} dakika</p>
            </div>

            <div>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>HATIRLATICI</span>
              <p className="font-medium mt-0.5" style={{ color: '#334155' }}>
                {apt.reminder_sent
                  ? `Gönderildi • ${formatDateTime(apt.reminder_sent_at)}`
                  : 'Henüz gönderilmedi'}
              </p>
            </div>
          </div>
        </div>

        {/* Hap Bilgi — Son SOAP Notu */}
        {hasHapBilgi && (
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: '#dde5e2', background: '#f8fafc' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-sm font-semibold" style={{ color: '#334155' }}>Son Seans Özeti</span>
              <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>
                {new Date(hapBilgi.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="p-5 space-y-3">
              {hapBilgi.s && (
                <div>
                  <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded text-white mb-1" style={{ background: '#3b82f6', fontSize: '10px' }}>S</span>
                  <p className="text-sm" style={{ color: '#334155' }}>{hapBilgi.s}</p>
                </div>
              )}
              {hapBilgi.o && (
                <div>
                  <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded text-white mb-1" style={{ background: '#22c55e', fontSize: '10px' }}>O</span>
                  <p className="text-sm" style={{ color: '#334155' }}>{hapBilgi.o}</p>
                </div>
              )}
              {hapBilgi.a && (
                <div>
                  <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded text-white mb-1" style={{ background: '#f59e0b', fontSize: '10px' }}>A</span>
                  <p className="text-sm" style={{ color: '#334155' }}>{hapBilgi.a}</p>
                </div>
              )}
              {hapBilgi.p && (
                <div>
                  <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded text-white mb-1" style={{ background: '#a855f7', fontSize: '10px' }}>P</span>
                  <p className="text-sm" style={{ color: '#334155' }}>{hapBilgi.p}</p>
                </div>
              )}
              {hapBilgi.genel && !hapBilgi.s && !hapBilgi.o && !hapBilgi.a && !hapBilgi.p && (
                <p className="text-sm" style={{ color: '#334155' }}>{hapBilgi.genel}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
