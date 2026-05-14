import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { connectWhatsApp } from '@/lib/whatsapp/baileys'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!psychologist) return new Response('Not found', { status: 404 })

  // SSE (Server-Sent Events) stream
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  function send(event: string, data: string) {
    writer.write(encoder.encode(`event: ${event}\ndata: ${data}\n\n`))
  }

  // Bağlantıyı arka planda başlat
  connectWhatsApp(
    psychologist.id,
    (qrDataUrl) => send('qr', qrDataUrl),
    (status) => {
      send(status, status)
      if (status === 'connected' || status === 'disconnected') {
        writer.close()
      }
    }
  ).catch(err => {
    send('error', err.message)
    writer.close()
  })

  // Client bağlantısı kesilince socket'ı temizle
  req.signal.addEventListener('abort', () => {
    writer.close().catch(() => {})
  })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
