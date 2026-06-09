const express = require('express')
const pino = require('pino')
const cron = require('node-cron')
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
  if (req.path === '/health' || req.path === '/ping') return next()
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
const sockets = new Map()          // psychologistId → socket
const qrCodes = new Map()          // psychologistId → qrDataUrl
const statuses = new Map()         // psychologistId → 'connecting'|'qr'|'connected'|'disconnected'
const reconnectCounts = new Map()  // psychologistId → consecutive fail count
const badMacCounts = new Map()     // psychologistId → bad mac error count
const connectingFlags = new Set()  // psychologistId → bağlantı kurulum süreci devam ediyor
// botSessions state türleri:
//   'awaiting_selection'        → randevu slot seçimi bekliyor
//   'awaiting_waitlist_response' → bekleme listesi teklifi yanıtı bekliyor
const botSessions = new Map()

// ── Session dizini ───────────────────────────────────────────
function sessionDir(id) {
  const dir = path.join('/tmp', 'wa-sessions', id)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

// ── DB'den session yükle (tüm dosyalar) ─────────────────────
async function loadSession(id) {
  const { data } = await getSupabase()
    .from('psychologists')
    .select('whatsapp_session')
    .eq('id', id)
    .single()

  if (!data?.whatsapp_session?.creds) return false

  const dir = sessionDir(id)
  const session = data.whatsapp_session

  // creds.json her zaman yaz
  fs.writeFileSync(path.join(dir, 'creds.json'), JSON.stringify(session.creds))

  // Signal anahtar dosyalarını geri yükle
  if (session.keys && typeof session.keys === 'object') {
    for (const [filename, content] of Object.entries(session.keys)) {
      try {
        fs.writeFileSync(path.join(dir, filename), JSON.stringify(content))
      } catch {}
    }
  }

  return true
}

// ── DB'ye session kaydet (tüm dosyalar) ─────────────────────
async function saveSession(id) {
  const dir = sessionDir(id)
  const credsPath = path.join(dir, 'creds.json')
  if (!fs.existsSync(credsPath)) return

  let creds
  try {
    const raw = fs.readFileSync(credsPath, 'utf8')
    if (!raw || raw.trim() === '') return
    creds = JSON.parse(raw)
  } catch {
    return
  }

  // Signal anahtar dosyalarını oku
  const keys = {}
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      if (file === 'creds.json') continue
      if (!file.endsWith('.json')) continue
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8')
        if (content && content.trim()) keys[file] = JSON.parse(content)
      } catch {}
    }
  } catch {}

  await getSupabase()
    .from('psychologists')
    .update({ whatsapp_session: { creds, keys }, is_connected: true })
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

// ── Gün adı eşleştirme ────────────────────────────────────────
const DAY_MAP = {
  0: 'pazar',
  1: 'pazartesi',
  2: 'salı',
  3: 'çarşamba',
  4: 'perşembe',
  5: 'cuma',
  6: 'cumartesi',
}

// ── Bot: Boş slot bul (work_days destekli) ────────────────────
async function findAvailableSlots(psychologistId, count) {
  const supabase = getSupabase()
  const slotDuration = 50

  const { data: psyData } = await supabase
    .from('psychologists')
    .select('work_start_hour, work_end_hour, work_days')
    .eq('id', psychologistId)
    .single()

  const workStart = psyData?.work_start_hour ?? 9
  const workEnd = psyData?.work_end_hour ?? 18
  const workDays = psyData?.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma']

  const now = new Date()
  const rangeEnd = new Date(now)
  rangeEnd.setDate(rangeEnd.getDate() + 14)

  const { data: existing } = await supabase
    .from('appointments')
    .select('appointment_date, duration_minutes')
    .eq('psychologist_id', psychologistId)
    .gte('appointment_date', now.toISOString())
    .lte('appointment_date', rangeEnd.toISOString())
    .not('status', 'eq', 'canceled')
    .not('status', 'eq', 'cancelled_by_patient')

  const occupied = (existing || []).map(a => ({
    start: new Date(a.appointment_date).getTime(),
    end: new Date(a.appointment_date).getTime() + (a.duration_minutes || 50) * 60000,
  }))

  const slots = []
  const cursor = new Date(now)
  const newMinutes = Math.ceil((cursor.getUTCMinutes() + 61) / slotDuration) * slotDuration
  cursor.setUTCMinutes(newMinutes, 0, 0)

  while (slots.length < count && cursor < rangeEnd) {
    // Istanbul time = UTC+3 (Turkey has no DST)
    const ist = new Date(cursor.getTime() + 3 * 60 * 60 * 1000)
    const dayName = DAY_MAP[ist.getUTCDay()]
    const hour = ist.getUTCHours()

    if (!workDays.includes(dayName) || hour < workStart || hour >= workEnd) {
      if (!workDays.includes(dayName) || hour >= workEnd) {
        // next day workStart in Istanbul
        ist.setUTCDate(ist.getUTCDate() + 1)
        ist.setUTCHours(workStart, 0, 0, 0)
      } else {
        // today workStart in Istanbul
        ist.setUTCHours(workStart, 0, 0, 0)
      }
      cursor.setTime(ist.getTime() - 3 * 60 * 60 * 1000)
      continue
    }

    const slotStart = cursor.getTime()
    const slotEnd = slotStart + slotDuration * 60000

    const conflict = occupied.some(o => slotStart < o.end && slotEnd > o.start)
    if (!conflict) slots.push(new Date(cursor))

    cursor.setUTCMinutes(cursor.getUTCMinutes() + slotDuration)
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

// ── Bekleme niyeti tespiti ────────────────────────────────────
function isBeklemIntent(text) {
  const keywords = ['UYGUN DEĞİL', 'UYGUN DEGIL', 'BEKLEME', 'BEKLE', 'BAŞKA ZAMAN', 'BASKA ZAMAN', 'MÜSAIT DEĞİL', 'MUSAIT DEGIL']
  return keywords.some(k => text.includes(k))
}

// ── Session temizle ve yeniden bağlan ────────────────────────
async function clearSessionAndReconnect(psychologistId, reason) {
  console.warn(`[${psychologistId}] Session temizleniyor: ${reason}`)
  badMacCounts.delete(psychologistId)
  reconnectCounts.delete(psychologistId)
  const dir = sessionDir(psychologistId)
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
  await getSupabase()
    .from('psychologists')
    .update({ whatsapp_session: null, is_connected: false })
    .eq('id', psychologistId)
    .catch(() => {})
  setTimeout(() => connectWhatsApp(psychologistId), 3000)
}

// ── WhatsApp bağlantısı kur ───────────────────────────────────
async function connectWhatsApp(psychologistId) {
  // Eş zamanlı çakışmayı önle — aynı psikolog için ikinci bağlantı açma
  if (connectingFlags.has(psychologistId)) {
    console.warn(`[${psychologistId}] Bağlantı zaten devam ediyor, atlanıyor`)
    return
  }
  connectingFlags.add(psychologistId)

  try {

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

  // Bad MAC hatalarını yakalayan custom logger
  const badMacLogger = {
    level: 'silent',
    child: () => badMacLogger,
    trace: () => {}, debug: () => {}, info: () => {}, warn: () => {},
    error: (...args) => {
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
      if (msg.includes('Bad MAC') || msg.includes('bad mac')) {
        const count = (badMacCounts.get(psychologistId) ?? 0) + 1
        badMacCounts.set(psychologistId, count)
        console.warn(`[${psychologistId}] Bad MAC #${count}`)
        if (count >= 5) {
          const sock = sockets.get(psychologistId)
          if (sock) { try { sock.end(undefined) } catch {} }
          sockets.delete(psychologistId)
          clearSessionAndReconnect(psychologistId, `Bad MAC loop (${count}x)`)
        }
      }
    },
  }

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, badMacLogger),
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
      connectingFlags.delete(psychologistId)
      qrCodes.delete(psychologistId)
      statuses.set(psychologistId, 'connected')
      reconnectCounts.delete(psychologistId)
      badMacCounts.delete(psychologistId)
      await setConnected(psychologistId, true)
    }

    if (connection === 'close') {
      connectingFlags.delete(psychologistId)
      const code = (lastDisconnect?.error)?.output?.statusCode
      const errMsg = lastDisconnect?.error?.message ?? ''
      const isConflict = errMsg.toLowerCase().includes('conflict') || errMsg.toLowerCase().includes('çakışma')
      sockets.delete(psychologistId)
      qrCodes.delete(psychologistId)
      statuses.set(psychologistId, 'disconnected')
      await setConnected(psychologistId, false)

      console.warn(`[${psychologistId}] Bağlantı kapandı — kod: ${code}, msj: ${errMsg}`)

      if (code === DisconnectReason.loggedOut && !isConflict) {
        // Gerçek logout — session temizle, QR gerekecek
        getSupabase()
          .from('psychologists')
          .update({ whatsapp_session: null })
          .eq('id', psychologistId)
          .then(() => {})
          .catch(() => {})
      } else if (
        errMsg.toLowerCase().includes('bad mac') ||
        errMsg.toLowerCase().includes('bad session') ||
        code === 403 || code === 500
      ) {
        await clearSessionAndReconnect(psychologistId, `disconnect code ${code}: ${errMsg}`)
      } else {
        // 440 (çakışma), 401 (stream hatası), 515 (restart) → sadece yeniden bağlan, session geçerli
        const attempts = (reconnectCounts.get(psychologistId) ?? 0) + 1
        reconnectCounts.set(psychologistId, attempts)
        const delay = code === 440 ? 2000 : 5000
        console.warn(`[${psychologistId}] Yeniden bağlanıyor (deneme ${attempts}, ${delay / 1000}s)`)
        if (attempts >= 5) {
          await clearSessionAndReconnect(psychologistId, `${attempts} ardışık başarısız deneme`)
        } else {
          setTimeout(() => connectWhatsApp(psychologistId), delay)
        }
      }
    }
  })

  // ── Gelen mesajları dinle (try-catch dışarıdan sarılı) ───────
  sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
    if (type !== 'notify' && type !== 'append') return
    for (const msg of msgs) {
      if (!msg.message || msg.key.fromMe) continue
      if (msg.key.remoteJid === 'status@broadcast') continue
      const jid = msg.key.remoteJid
      if (!jid || !jid.endsWith('@s.whatsapp.net')) continue
      const phone = jid.replace('@s.whatsapp.net', '')
      const rawText = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ''
      ).trim()
      const text = rawText.toUpperCase()
      console.log(`[msg] ${phone} → "${rawText}"`)

      // ── Bekleme listesi teklif yanıtı (in-memory, önce kontrol et) ─
      const session = botSessions.get(phone)
      if (session?.state === 'awaiting_waitlist_response' && session.expiresAt > Date.now()) {
        if (text === 'EVET') {
          const supabase = getSupabase()

          // Hasta bul veya oluştur
          let { data: patient } = await supabase
            .from('patients')
            .select('id')
            .eq('psychologist_id', psychologistId)
            .filter('phone_number', 'ilike', `%${phone.slice(-9)}`)
            .maybeSingle()

          if (!patient) {
            const { data: newPatient } = await supabase
              .from('patients')
              .insert({
                psychologist_id: psychologistId,
                name_surname: session.name,
                phone_number: normalizePhone(phone),
              })
              .select('id')
              .single()
            patient = newPatient
          }

          if (patient) {
            await supabase.from('appointments').insert({
              psychologist_id: psychologistId,
              patient_id: patient.id,
              appointment_date: session.slotDate,
              duration_minutes: 50,
              status: 'confirmed',
              appointment_type: 'yuzyuze',
            })

            await supabase
              .from('waiting_list')
              .update({ status: 'booked', offer_status: 'accepted' })
              .eq('id', session.waitlistId)

            botSessions.delete(phone)
            await sock.sendMessage(jid, { text: '✅ Harika! Randevunuz oluşturuldu. Görüşmek üzere!' })
          }
        } else if (text === 'HAYIR' || text === 'IPTAL' || text === 'İPTAL') {
          await getSupabase()
            .from('waiting_list')
            .update({ status: 'waiting', offer_status: 'rejected' })
            .eq('id', session.waitlistId)

          botSessions.delete(phone)
          await sock.sendMessage(jid, { text: 'Anlaşıldı, sizi listede tutuyoruz. Yeni bir uygun saat çıktığında tekrar haberdar edeceğiz.' })

          // Bir sonraki kişiye cascade tetikle
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/waiting-list/cascade`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ psychologist_id: psychologistId, slot_date: session.slotDate }),
            })
          } catch {}
        }
        continue
      }

      // ── Diğer tüm mesajları Next.js bot'a ilet ──────────────
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (appUrl) {
          await fetch(`${appUrl}/api/whatsapp/incoming`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.WA_API_KEY,
            },
            body: JSON.stringify({
              psychologistId,
              phone: normalizePhone(phone),
              message: rawText,
            }),
            signal: AbortSignal.timeout(15000),
          })
        }
      } catch (err) {
        console.error(`[incoming] Next.js bot iletim hatası: ${err.message}`)
      }
    }
  })

  } catch (err) {
    connectingFlags.delete(psychologistId)
    console.error(`[${psychologistId}] connectWhatsApp kurulum hatası:`, err.message)
  }
}

// ── Endpoints ─────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/ping', (req, res) => res.json({ version: 'v3-2026-06-03', connectedCount: sockets.size }))

app.post('/connect/:id', async (req, res) => {
  const { id } = req.params
  await getSupabase()
    .from('psychologists')
    .update({ whatsapp_session: null, is_connected: false })
    .eq('id', id)
  const dir = sessionDir(id)
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
  fs.mkdirSync(dir, { recursive: true })

  connectWhatsApp(id).catch(console.error)
  res.json({ ok: true, message: 'Bağlantı başlatıldı' })
})

app.get('/qr/:id', (req, res) => {
  const { id } = req.params
  const status = statuses.get(id) || 'idle'
  const qr = qrCodes.get(id) || null
  res.json({ status, qr })
})

app.get('/status/:id', (req, res) => {
  const { id } = req.params
  const status = statuses.get(id) || 'idle'
  res.json({ status, connected: status === 'connected' })
})

app.post('/send', async (req, res) => {
  const { psychologistId, phone, message } = req.body

  const sock = sockets.get(psychologistId)

  if (!sock || statuses.get(psychologistId) !== 'connected') {
    // Bağlı değilse yeniden bağlanmayı tetikle — connectingFlags kontrolüyle çakışma önle
    if (!connectingFlags.has(psychologistId) && (statuses.get(psychologistId) === 'disconnected' || !sock)) {
      connectWhatsApp(psychologistId).catch(() => {})
    }
    return res.status(503).json({ error: 'WhatsApp bağlı değil, yeniden bağlanıyor' })
  }

  try {
    const jid = `${normalizePhone(phone)}@s.whatsapp.net`
    await sock.sendMessage(jid, { text: message })
    res.json({ ok: true })
  } catch (err) {
    console.error('[send] sendMessage hatası:', err.message)
    // Gönderim hatasında socket'i temizle ve reconnect tetikle
    sockets.delete(psychologistId)
    statuses.set(psychologistId, 'disconnected')
    connectWhatsApp(psychologistId).catch(() => {})
    res.status(500).json({ error: 'Mesaj gönderilemedi, yeniden bağlanıyor' })
  }
})

// ── Makbuz PDF gönder ─────────────────────────────────────────
app.post('/send-document', async (req, res) => {
  const { psychologistId, phone, pdfBase64, fileName, caption } = req.body

  const sock = sockets.get(psychologistId)
  if (!sock || statuses.get(psychologistId) !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp bağlı değil' })
  }

  try {
    const jid = `${normalizePhone(phone)}@s.whatsapp.net`
    const buffer = Buffer.from(pdfBase64, 'base64')
    await sock.sendMessage(jid, {
      document: buffer,
      mimetype: 'application/pdf',
      fileName: fileName || 'seans-makbuz.pdf',
      caption: caption || '',
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[send-document] hata:', err.message)
    res.status(500).json({ error: 'Makbuz gönderilemedi' })
  }
})

// ── Cascade offer endpoint — Next.js'den çağrılır ────────────
app.post('/cascade-offer', async (req, res) => {
  const { waitlistId, psychologistId, phone, slotDate, name } = req.body
  if (!waitlistId || !psychologistId || !phone || !slotDate) {
    return res.status(400).json({ error: 'Eksik parametre' })
  }

  const sock = sockets.get(psychologistId)
  if (!sock || statuses.get(psychologistId) !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp bağlı değil' })
  }

  const jid = `${phone}@s.whatsapp.net`
  const slotStr = new Date(slotDate).toLocaleString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })

  botSessions.set(phone, {
    state: 'awaiting_waitlist_response',
    waitlistId,
    psychologistId,
    slotDate,
    name: name || phone,
    expiresAt: Date.now() + 30 * 60 * 1000,
  })

  await sock.sendMessage(jid, {
    text: `Merhaba ${name ? name.split(' ')[0] : ''}! 🗓️ Bekleme listenizdeki için bir randevu açıldı:\n\n*${slotStr}*\n\nBu tarih size uygun mu?\n✅ *EVET* yazın → randevunuz oluşturulsun\n❌ *HAYIR* yazın → listede kalmaya devam edin\n\n_(30 dakika içinde yanıt vermezseniz sıradaki kişiye geçilir.)_`,
  })

  res.json({ ok: true })
})

// Signal key'leri sıfırla — bağlantıyı kesmeden Bad MAC sorununu çözer
app.post('/reset-keys/:id', async (req, res) => {
  const { id } = req.params

  // Mevcut soketi kapat
  const oldSock = sockets.get(id)
  if (oldSock) {
    try { oldSock.end(undefined) } catch {}
    sockets.delete(id)
  }
  statuses.set(id, 'connecting')

  // /tmp'deki session dosyalarından sadece signal key'lerini sil, creds.json'u koru
  const dir = sessionDir(id)
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      if (file === 'creds.json') continue
      try { fs.unlinkSync(path.join(dir, file)) } catch {}
    }
  } catch {}

  // Supabase'deki session'dan da sadece keys kısmını temizle
  const { data: current } = await getSupabase()
    .from('psychologists')
    .select('whatsapp_session')
    .eq('id', id)
    .single()

  if (current?.whatsapp_session?.creds) {
    await getSupabase()
      .from('psychologists')
      .update({ whatsapp_session: { creds: current.whatsapp_session.creds, keys: {} } })
      .eq('id', id)
  }

  // Yeniden bağlan
  setTimeout(() => connectWhatsApp(id).catch(console.error), 1000)
  res.json({ ok: true, message: 'Signal key\'ler sıfırlandı, yeniden bağlanılıyor' })
})

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

// ── Saatlik hatırlatıcı cron ──────────────────────────────────
cron.schedule('0 * * * *', async () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seansify.com'
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return
  try {
    const res = await fetch(`${appUrl}/api/cron/send-reminders`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    })
    const data = await res.json()
    console.log(`[cron] Hatırlatıcılar gönderildi: ${data.sent ?? 0}`)
  } catch (err) {
    console.error('[cron] Hatırlatıcı hatası:', err.message)
  }
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

  // Keepalive — Railway sleep engellemek için her 4 dakikada kendine ping
  setInterval(() => {
    fetch(`http://localhost:${PORT}/ping`).catch(() => {})
  }, 4 * 60 * 1000)

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
