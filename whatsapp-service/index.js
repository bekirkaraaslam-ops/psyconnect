const express = require('express')
const pino = require('pino')
const makeWASocket = require('@whiskeysockets/baileys').default
const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const QRCode = require('qrcode')
const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json())

// ── Güvenlik: API key kontrolü ───────────────────────────────
const API_KEY = process.env.WA_API_KEY
app.use((req, res, next) => {
  if (req.path === '/health') return next()
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

// ── Telefon numarası normalleştirme ──────────────────────────
function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

// ── Supabase admin ───────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: ws } }
  )
}

// ── In-memory socket + QR deposu ─────────────────────────────
const sockets = new Map()     // psychologistId → socket
const qrCodes = new Map()     // psychologistId → qrDataUrl
const statuses = new Map()    // psychologistId → 'connecting'|'qr'|'connected'|'disconnected'
const botSessions = new Map() // phone → { state, slots, psychologistId, expiresAt }

// ── Session dizini ───────────────────────────────────────────
function sessionDir(id) {
  const dir = path.join('/tmp', 'wa-sessions', id)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

// ── DB'den session yükle ─────────────────────────────────────
async function loadSession(id) {
  const { data } = await getSupabase()
    .from('psychologists')
    .select('whatsapp_session')
    .eq('id', id)
    .single()

  if (!data?.whatsapp_session?.creds) return false

  const dir = sessionDir(id)
  fs.writeFileSync(
    path.join(dir, 'creds.json'),
    JSON.stringify(data.whatsapp_session.creds)
  )
  return true
}

// ── DB'ye session kaydet ─────────────────────────────────────
async function saveSession(id) {
  const credsPath = path.join(sessionDir(id), 'creds.json')
  if (!fs.existsSync(credsPath)) return
  let creds
  try {
    const raw = fs.readFileSync(credsPath, 'utf8')
    if (!raw || raw.trim() === '') return
    creds = JSON.parse(raw)
  } catch {
    return // bozuk JSON — sonraki creds.update'te tekrar denenecek
  }
  await getSupabase()
    .from('psychologists')
    .update({ whatsapp_session: { creds }, is_connected: true })
    .eq('id', id)
}

// ── Bağlantı durumunu DB'ye yaz ──────────────────────────────
async function setConnected(id, value) {
  await getSupabase()
    .from('psychologists')
    .update({ is_connected: value })
    .eq('id', id)
}

// ── Bot: Türkçe tarih formatı ─────────────────────────────────
function formatSlotTR(date) {
  const dayPart = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone: 'Europe/Istanbul',
  })
  const timePart = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })
  return `${dayPart} - ${timePart}`
}

// ── Bot: Boş slot bul ─────────────────────────────────────────
async function findAvailableSlots(psychologistId, count) {
  const supabase = getSupabase()
  const slotDuration = 50 // dakika
  const workStart = 9
  const workEnd = 18

  const now = new Date()
  const rangeStart = new Date(now)
  const rangeEnd = new Date(now)
  rangeEnd.setDate(rangeEnd.getDate() + 14)

  const { data: existing } = await supabase
    .from('appointments')
    .select('appointment_date, duration_minutes')
    .eq('psychologist_id', psychologistId)
    .gte('appointment_date', rangeStart.toISOString())
    .lte('appointment_date', rangeEnd.toISOString())
    .not('status', 'eq', 'canceled')
    .not('status', 'eq', 'cancelled_by_patient')

  const occupied = (existing || []).map(a => ({
    start: new Date(a.appointment_date).getTime(),
    end: new Date(a.appointment_date).getTime() + (a.duration_minutes || 50) * 60000,
  }))

  const slots = []
  const cursor = new Date(now)
  cursor.setSeconds(0, 0)
  cursor.setMinutes(Math.ceil((cursor.getMinutes() + 61) / slotDuration) * slotDuration)

  while (slots.length < count && cursor < rangeEnd) {
    const day = cursor.getDay() // 0=Pazar
    const hour = cursor.getHours()

    if (day === 0 || hour < workStart || hour >= workEnd) {
      if (day === 0 || hour >= workEnd) {
        cursor.setDate(cursor.getDate() + 1)
        cursor.setHours(workStart, 0, 0, 0)
      } else {
        cursor.setHours(workStart, 0, 0, 0)
      }
      continue
    }

    const slotStart = cursor.getTime()
    const slotEnd = slotStart + slotDuration * 60000

    const conflict = occupied.some(o => slotStart < o.end && slotEnd > o.start)

    if (!conflict) {
      slots.push(new Date(cursor))
    }

    cursor.setMinutes(cursor.getMinutes() + slotDuration)
  }

  return slots
}

// ── Bot: Randevu oluştur ──────────────────────────────────────
async function createBotAppointment(psychologistId, phone, nameSurname, slot, sock, jid) {
  const supabase = getSupabase()

  let { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('psychologist_id', psychologistId)
    .filter('phone_number', 'ilike', `%${phone.slice(-9)}`)
    .maybeSingle()

  if (!patient) {
    const normalized = normalizePhone(phone)
    const { data: newPatient } = await supabase
      .from('patients')
      .insert({
        psychologist_id: psychologistId,
        name_surname: nameSurname,
        phone_number: normalized,
      })
      .select('id')
      .single()
    patient = newPatient
  }

  if (!patient) {
    await sock.sendMessage(jid, { text: 'Randevu oluşturulurken bir hata oluştu. Lütfen kliniği arayınız.' })
    return
  }

  await supabase
    .from('appointments')
    .insert({
      psychologist_id: psychologistId,
      patient_id: patient.id,
      appointment_date: slot.toISOString(),
      duration_minutes: 50,
      status: 'seansify_pending',
      appointment_type: 'yuzyuze',
    })

  await sock.sendMessage(jid, {
    text: 'Talebiniz alınmıştır, randevunuz kliniğin onayına sunulmuştur.',
  })
}

// ── WhatsApp bağlantısı kur ───────────────────────────────────
async function connectWhatsApp(psychologistId) {
  if (sockets.has(psychologistId)) {
    try { sockets.get(psychologistId).end(undefined) } catch {}
    sockets.delete(psychologistId)
  }

  statuses.set(psychologistId, 'connecting')
  qrCodes.delete(psychologistId)

  await loadSession(psychologistId)

  const dir = sessionDir(psychologistId)
  const { state, saveCreds } = await useMultiFileAuthState(dir)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, { level: 'silent', child: () => ({ level: 'silent' }), trace: () => {}, debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }),
    },
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
  })

  sockets.set(psychologistId, sock)

  sock.ev.on('creds.update', async () => {
    await saveCreds()
    await saveSession(psychologistId)
  })

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      const qrDataUrl = await QRCode.toDataURL(qr)
      qrCodes.set(psychologistId, qrDataUrl)
      statuses.set(psychologistId, 'qr')
    }

    if (connection === 'open') {
      qrCodes.delete(psychologistId)
      statuses.set(psychologistId, 'connected')
      await setConnected(psychologistId, true)
    }

    if (connection === 'close') {
      const code = (lastDisconnect?.error)?.output?.statusCode
      sockets.delete(psychologistId)
      qrCodes.delete(psychologistId)
      statuses.set(psychologistId, 'disconnected')
      await setConnected(psychologistId, false)

      if (code !== DisconnectReason.loggedOut) {
        setTimeout(() => connectWhatsApp(psychologistId), 5000)
      } else {
        // Loggedout — session'ı DB'den temizle
        getSupabase()
          .from('psychologists')
          .update({ whatsapp_session: null })
          .eq('id', psychologistId)
          .then(() => {})
          .catch(() => {})
      }
    }
  })

  // ── Gelen mesajları dinle (bot + onay/iptal) ──────────────────
  sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
    if (type !== 'notify') return
    for (const msg of msgs) {
      if (!msg.message || msg.key.fromMe) continue
      const jid = msg.key.remoteJid
      if (!jid || !jid.endsWith('@s.whatsapp.net')) continue
      const phone = jid.replace('@s.whatsapp.net', '')
      const rawText = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ''
      ).trim()
      const text = rawText.toUpperCase()

      // ── Bot: Randevu talebi ──────────────────────────────────
      if (text.includes('RANDEVU') && rawText.length < 50) {
        const slots = await findAvailableSlots(psychologistId, 3)
        if (slots.length === 0) {
          await sock.sendMessage(jid, { text: 'Şu an müsait randevu saati bulunamadı. Lütfen daha sonra tekrar deneyin.' })
          continue
        }
        botSessions.set(phone, {
          state: 'awaiting_selection',
          slots,
          psychologistId,
          expiresAt: Date.now() + 10 * 60 * 1000,
        })
        const lines = slots.map((s, i) => `${i + 1}) ${formatSlotTR(s)}`).join('\n')
        await sock.sendMessage(jid, {
          text: `Merhaba! Size en yakın uygun randevu saatlerimiz şunlardır:\n\n${lines}\n\nRandevunuzu oluşturmak için lütfen seçtiğiniz numarayı ve adınızı yazın.\nÖrnek: *1, Ahmet Yılmaz*`,
        })
        continue
      }

      // ── Bot: Seçim cevabı "1, Ahmet Yılmaz" ─────────────────
      const session = botSessions.get(phone)
      if (session && session.state === 'awaiting_selection' && session.expiresAt > Date.now()) {
        const match = rawText.match(/^(\d)[,\s]+(.+)$/)
        if (match) {
          const slotIndex = parseInt(match[1]) - 1
          const nameSurname = match[2].trim()
          if (slotIndex >= 0 && slotIndex < session.slots.length) {
            const selectedSlot = session.slots[slotIndex]
            botSessions.delete(phone)
            await createBotAppointment(session.psychologistId, phone, nameSurname, selectedSlot, sock, jid)
            continue
          }
        }
      }

      if (text !== 'EVET' && text !== 'IPTAL' && text !== 'İPTAL') continue

      const supabase = getSupabase()

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('psychologist_id', psychologistId)
        .filter('phone_number', 'ilike', `%${phone.slice(-9)}`)
        .single()

      if (!patient) continue

      const now = new Date().toISOString()
      const { data: apt } = await supabase
        .from('appointments')
        .select('id, appointment_date, psychologist_id, psychologist:psychologists(id, full_name, phone_number)')
        .eq('patient_id', patient.id)
        .eq('psychologist_id', psychologistId)
        .eq('status', 'waiting')
        .gt('appointment_date', now)
        .order('appointment_date')
        .limit(1)
        .single()

      if (!apt) continue

      if (text === 'EVET') {
        await supabase
          .from('appointments')
          .update({ status: 'confirmed', patient_responded_at: now })
          .eq('id', apt.id)

        await sock.sendMessage(jid, {
          text: '✅ Randevunuz onaylandı. Görüşmek üzere!'
        })
        console.log(`[wa] ✓ Hasta onayladı → apt: ${apt.id}`)

      } else {
        await supabase
          .from('appointments')
          .update({ status: 'cancelled_by_patient', patient_responded_at: now })
          .eq('id', apt.id)

        await sock.sendMessage(jid, {
          text: '❌ Randevunuz iptal edildi. İptalinizi aldık, iyi günler.'
        })

        const psyPhone = apt.psychologist?.phone_number
        if (psyPhone) {
          const aptDate = new Date(apt.appointment_date).toLocaleString('tr-TR', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
            timeZone: 'Europe/Istanbul'
          })
          await sock.sendMessage(`${normalizePhone(psyPhone)}@s.whatsapp.net`, {
            text: `❌ *Randevu İptali*\n\nBir hasta randevusunu iptal etti.\nTarih: ${aptDate}`
          })
        }
        console.log(`[wa] ✗ Hasta iptal etti → apt: ${apt.id}`)
      }
    }
  })
}

// ── Endpoints ─────────────────────────────────────────────────

// Sağlık kontrolü
app.get('/health', (req, res) => res.json({ ok: true }))

// Bağlantı başlat
app.post('/connect/:id', async (req, res) => {
  const { id } = req.params
  // Eski/bozuk session'ı temizle — her zaman taze QR ile başla
  await getSupabase()
    .from('psychologists')
    .update({ whatsapp_session: null, is_connected: false })
    .eq('id', id)
  // /tmp session dizinini temizle
  const dir = sessionDir(id)
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
  fs.mkdirSync(dir, { recursive: true })

  connectWhatsApp(id).catch(console.error)
  res.json({ ok: true, message: 'Bağlantı başlatıldı' })
})

// QR kodu al
app.get('/qr/:id', (req, res) => {
  const { id } = req.params
  const status = statuses.get(id) || 'idle'
  const qr = qrCodes.get(id) || null
  res.json({ status, qr })
})

// Durum al
app.get('/status/:id', (req, res) => {
  const { id } = req.params
  const status = statuses.get(id) || 'idle'
  res.json({ status, connected: status === 'connected' })
})

// Mesaj gönder
app.post('/send', async (req, res) => {
  const { psychologistId, phone, message } = req.body

  let sock = sockets.get(psychologistId)

  if (!sock || statuses.get(psychologistId) !== 'connected') {
    await loadSession(psychologistId)
    const dir = sessionDir(psychologistId)
    const { state, saveCreds } = await useMultiFileAuthState(dir)
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
    })
    sockets.set(psychologistId, sock)
    sock.ev.on('creds.update', saveCreds)

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Bağlantı zaman aşımı')), 25000)
      sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') { clearTimeout(timeout); resolve() }
        if (connection === 'close') { clearTimeout(timeout); reject(new Error('Bağlanamadı')) }
      })
    })
  }

  const jid = `${phone}@s.whatsapp.net`
  await sock.sendMessage(jid, { text: message })
  res.json({ ok: true })
})

// Bağlantıyı kes
app.post('/disconnect/:id', async (req, res) => {
  const { id } = req.params
  const sock = sockets.get(id)
  if (sock) {
    try { await sock.logout() } catch {}
    sockets.delete(id)
  }
  qrCodes.delete(id)
  statuses.set(id, 'disconnected')
  await getSupabase()
    .from('psychologists')
    .update({ whatsapp_session: null, is_connected: false })
    .eq('id', id)
  res.json({ ok: true })
})

// ── Servisin çökmesini engelle ────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message)
})
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})

// ── Sunucu başlat ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, async () => {
  console.log(`WhatsApp servisi çalışıyor: port ${PORT}`)

  // Daha önce bağlı olan psikologları otomatik yeniden bağla
  try {
    const { data: connected } = await getSupabase()
      .from('psychologists')
      .select('id, full_name')
      .eq('is_connected', true)

    if (connected?.length) {
      console.log(`[startup] ${connected.length} psikolog için oturum yükleniyor...`)
      for (const psy of connected) {
        try {
          await connectWhatsApp(psy.id)
          console.log(`[startup] ✓ ${psy.full_name} bağlandı`)
        } catch (err) {
          console.error(`[startup] ✗ ${psy.full_name} bağlanamadı:`, err.message)
        }
      }
    } else {
      console.log('[startup] Bağlı psikolog yok.')
    }
  } catch (err) {
    console.error('[startup] Otomatik bağlantı hatası:', err.message)
  }
})
