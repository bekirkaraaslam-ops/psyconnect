/**
 * Baileys WhatsApp Engine
 *
 * Her psikolog için ayrı bir in-memory socket yönetir.
 * Session verisi Supabase'de JSONB olarak saklanır ve
 * her bağlantıda yüklenir / güncellenir.
 */

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  AuthenticationState,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'

// ── Supabase admin (sunucu tarafı) ──────────────────────────
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── In-memory socket deposu (process-lifetime) ───────────────
const sockets = new Map<string, ReturnType<typeof makeWASocket>>()

// ── Session dizini: /tmp/<psychologistId> ────────────────────
function sessionDir(psychologistId: string) {
  const dir = path.join('/tmp', 'wa-sessions', psychologistId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

// ── Supabase'den session yükle → /tmp dosyalarına yaz ────────
async function loadSessionFromDB(psychologistId: string): Promise<boolean> {
  const supabase = getAdminSupabase()
  const { data } = await supabase
    .from('psychologists')
    .select('whatsapp_session')
    .eq('id', psychologistId)
    .single()

  if (!data?.whatsapp_session) return false

  const dir = sessionDir(psychologistId)
  const session = data.whatsapp_session as Record<string, unknown>

  // Creds dosyasını yaz
  if (session.creds) {
    fs.writeFileSync(
      path.join(dir, 'creds.json'),
      JSON.stringify(session.creds)
    )
  }

  return true
}

// ── /tmp dosyalarından session oku → Supabase'e kaydet ───────
async function saveSessionToDB(psychologistId: string) {
  const dir = sessionDir(psychologistId)
  const credsPath = path.join(dir, 'creds.json')

  if (!fs.existsSync(credsPath)) return

  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
  const supabase = getAdminSupabase()

  await supabase
    .from('psychologists')
    .update({ whatsapp_session: { creds }, is_connected: true })
    .eq('id', psychologistId)
}

// ── Bağlantı durumunu DB'ye yaz ──────────────────────────────
async function setConnected(psychologistId: string, value: boolean) {
  const supabase = getAdminSupabase()
  await supabase
    .from('psychologists')
    .update({ is_connected: value })
    .eq('id', psychologistId)
}

// ── QR stream callback tipi ──────────────────────────────────
type OnQR       = (qrDataUrl: string) => void
type OnStatus   = (status: 'connected' | 'disconnected' | 'qr') => void

// ── Ana bağlantı fonksiyonu ──────────────────────────────────
export async function connectWhatsApp(
  psychologistId: string,
  onQR: OnQR,
  onStatus: OnStatus
) {
  // Önceki socket varsa kapat
  if (sockets.has(psychologistId)) {
    try { sockets.get(psychologistId)!.end(undefined) } catch {}
    sockets.delete(psychologistId)
  }

  await loadSessionFromDB(psychologistId)

  const dir = sessionDir(psychologistId)
  const { state, saveCreds } = await useMultiFileAuthState(dir)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, console as any),
    },
    printQRInTerminal: false,
    logger: { level: 'silent' } as any,
  })

  sockets.set(psychologistId, sock)

  sock.ev.on('creds.update', async () => {
    await saveCreds()
    await saveSessionToDB(psychologistId)
  })

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      const qrDataUrl = await QRCode.toDataURL(qr)
      onQR(qrDataUrl)
      onStatus('qr')
    }

    if (connection === 'open') {
      await setConnected(psychologistId, true)
      onStatus('connected')
    }

    if (connection === 'close') {
      const code = (lastDisconnect?.error as Boom)?.output?.statusCode
      await setConnected(psychologistId, false)
      sockets.delete(psychologistId)
      onStatus('disconnected')

      // Oturum geçerliyse yeniden bağlan
      if (code !== DisconnectReason.loggedOut) {
        setTimeout(() => connectWhatsApp(psychologistId, onQR, onStatus), 5000)
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (msg.key.fromMe) continue
      if (!msg.message) continue
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ''
      if (!text.trim()) continue
      const phone = msg.key.remoteJid?.replace('@s.whatsapp.net', '') ?? ''
      if (!phone || phone.includes('@g.us')) continue

      const appUrl = process.env.APP_URL
      if (!appUrl) continue
      try {
        await fetch(`${appUrl}/api/whatsapp/incoming`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.WA_API_KEY ?? '',
          },
          body: JSON.stringify({ psychologistId, phone, message: text.trim() }),
        })
      } catch (err) {
        console.error('[baileys] incoming webhook hatası:', err)
      }
    }
  })
}

// ── Mesaj gönder ─────────────────────────────────────────────
export async function sendMessage(
  psychologistId: string,
  toPhone: string,
  text: string
): Promise<void> {
  let sock = sockets.get(psychologistId)

  if (!sock) {
    // Socket yoksa yeni bağlantı kur (cron context)
    await loadSessionFromDB(psychologistId)
    const dir = sessionDir(psychologistId)
    const { state, saveCreds } = await useMultiFileAuthState(dir)
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console as any),
      },
      printQRInTerminal: false,
      logger: { level: 'silent' } as any,
    })
    sockets.set(psychologistId, sock)

    // Bağlantı açılana kadar bekle
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Bağlantı zaman aşımı')), 20_000)
      sock!.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') { clearTimeout(timeout); resolve() }
        if (connection === 'close') { clearTimeout(timeout); reject(new Error('Bağlanamadı')) }
      })
    })
  }

  const jid = `${toPhone}@s.whatsapp.net`
  await sock.sendMessage(jid, { text })
}

// ── Bağlantıyı kes ───────────────────────────────────────────
export async function disconnectWhatsApp(psychologistId: string) {
  const sock = sockets.get(psychologistId)
  if (sock) {
    await sock.logout()
    sockets.delete(psychologistId)
  }

  // DB'de session ve bağlantı durumunu sıfırla
  const supabase = getAdminSupabase()
  await supabase
    .from('psychologists')
    .update({ whatsapp_session: null, is_connected: false })
    .eq('id', psychologistId)
}

// ── Bağlantı durumu ──────────────────────────────────────────
export function isConnected(psychologistId: string): boolean {
  return sockets.has(psychologistId)
}
