import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import QRConnect from '@/components/whatsapp/QRConnect'
import ReminderTestButton from '@/components/whatsapp/ReminderTestButton'
import { formatDateTime } from '@/lib/utils'

export default async function WhatsAppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id, is_connected')
    .eq('auth_user_id', user!.id)
    .single()

  // Son 10 hatırlatıcı logu
  const { data: logs } = await supabase
    .from('reminder_logs')
    .select('*, appointment:appointments(appointment_date, patient:patients(name_surname))')
    .in(
      'appointment_id',
      (
        await supabase
          .from('appointments')
          .select('id')
          .eq('psychologist_id', psychologist!.id)
      ).data?.map(a => a.id) ?? []
    )
    .order('sent_at', { ascending: false })
    .limit(10)

  return (
    <div className="flex-1">
      <Topbar title="WhatsApp Bağlantısı" />

      <div className="p-6 space-y-6">
        <div className="flex justify-center">
          <QRConnect isConnected={psychologist?.is_connected ?? false} />
        </div>

        <div className="flex justify-center">
          <a
            href="/api/diagnose"
            target="_blank"
            className="text-xs underline"
            style={{ color: '#64748b' }}
          >
            Sistem durumunu kontrol et →
          </a>
        </div>

        {/* Test butonu */}
        {psychologist?.is_connected && (
          <div className="flex justify-center">
            <ReminderTestButton />
          </div>
        )}

        {/* Nasıl çalışır */}
        <div className="bg-white rounded-2xl border p-5 max-w-sm mx-auto" style={{ borderColor: '#dde5e2' }}>
          <h3 className="font-semibold mb-4 text-sm" style={{ color: '#334155' }}>Nasıl Çalışır?</h3>
          <div className="space-y-3">
            {[
              { icon: '📱', text: 'WhatsApp\'ı açın ve Bağlı Cihazlar\'a gidin' },
              { icon: '🔗', text: '"Cihaz Bağla" butonuna basın' },
              { icon: '📷', text: 'Yukarıdaki QR kodu kameranıza gösterin' },
              { icon: '✅', text: 'Bağlantı otomatik kurulur, tekrar gerekmez' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg">{step.icon}</span>
                <p className="text-sm" style={{ color: '#64748b' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Log tablosu */}
        {logs && logs.length > 0 && (
          <div className="max-w-sm mx-auto">
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#334155' }}>Son Hatırlatıcılar</h3>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
              <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#334155' }}>
                        {log.appointment?.patient?.name_surname ?? '—'}
                      </p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{formatDateTime(log.sent_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {log.status === 'success' ? 'Gönderildi' : 'Hata'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
