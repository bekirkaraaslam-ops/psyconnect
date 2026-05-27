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
      const errMsg = lastDisconnect?.error?.message ?? ''
      sockets.delete(psychologistId)
      qrCodes.delete(psychologistId)
      statuses.set(psychologistId, 'disconnected')
      await setConnected(psychologistId, false)

      if (code === DisconnectReason.loggedOut) {
        getSupabase()
          .from('psychologists')
          .update({ whatsapp_session: null })
          .eq('id', psychologistId)
          .then(() => {})
          .catch(() => {})
      } else if (errMsg.includes('Bad MAC') || code === 401 || code === 403) {
        // Bozuk session — temizle ve QR ile yeniden bağlan
        console.warn(`[${psychologistId}] Bad MAC / auth hatası — session temizleniyor`)
        const dir = sessionDir(psychologistId)
        try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
        await getSupabase()
          .from('psychologists')
          .update({ whatsapp_session: null })
          .eq('id', psychologistId)
          .catch(() => {})
        setTimeout(() => connectWhatsApp(psychologistId), 3000)
      } else {
        setTimeout(() => connectWhatsApp(psychologistId), 5000)
      }
    }
  })

  // ── Gelen mesajları dinle ─────────────────────────────────────
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
      console.log(`[msg] ${phone} → "${rawText}"`)

      // ── Mesai dışı koruma ────────────────────────────────────
      const { data: psyData } = await getSupabase()
        .from('psychologists')
        .select('work_start_hour, work_end_hour')
        .eq('id', psychologistId)
        .single()

      const workStart = psyData?.work_start_hour ?? 9
      const workEnd = psyData?.work_end_hour ?? 18
      const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }))
      const currentHour = nowIST.getHours()
      const isOutsideWorkHours = currentHour < workStart || currentHour >= workEnd

      if (isOutsideWorkHours && text !== 'EVET' && text !== 'IPTAL' && text !== 'İPTAL' && !text.includes('RANDEVU')) {
        const session = botSessions.get(phone)
        if (!session || session.expiresAt <= Date.now()) {
          const startStr = String(workStart).padStart(2, '0') + ':00'
          await sock.sendMessage(jid, {
            text: `Şu an mesai saatleri dışındayız. ${startStr}'de size yardımcı olmaya çalışacağız. 🕐`,
          })
          continue
        }
      }

      // ── Bekleme listesi teklif yanıtı ────────────────────────
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
          text: `Merhaba! Size en yakın uygun randevu saatlerimiz şunlardır:\n\n${lines}\n\nRandevunuzu oluşturmak için lütfen seçtiğiniz numarayı ve adınızı yazın.\nÖrnek: *1, Ahmet Yılmaz*\n\nBu saatler size uygun değilse *bekleme listesi* yazabilirsiniz.`,
        })
        continue
      }

      // ── Bot: Seçim cevabı "1, Ahmet Yılmaz" ─────────────────
      if (session && session.state === 'awaiting_selection' && session.expiresAt > Date.now()) {
        // Bekleme listesi isteği
        if (isBeklemIntent(text)) {
          botSessions.delete(phone)
          const { data: psySlug } = await getSupabase().from('psychologists').select('booking_slug').eq('id', psychologistId).single()
          const waitSlug = psySlug?.booking_slug ?? psychologistId
          const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bekle/${waitSlug}`
          await sock.sendMessage(jid, {
            text: `Sizi bekleme listesine ekleyebiliriz! Aşağıdaki linkten bilgilerinizi doldurun, müsait randevu çıktığında WhatsApp'tan bildirim alırsınız:\n\n${registrationUrl}`,
          })
          continue
        }

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

      if (text !== 'EVET' && text !== 'ONAYLA' && text !== 'IPTAL' && text !== 'İPTAL') continue

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

      if (text === 'EVET' || text === 'ONAYLA') {
        await supabase
          .from('appointments')
          .update({ status: 'confirmed', patient_responded_at: now })
          .eq('id', apt.id)

        await sock.sendMessage(jid, { text: '✅ Randevunuz onaylandı. Görüşmek üzere!' })

      } else {
        await supabase
          .from('appointments')
          .update({ status: 'cancelled_by_patient', patient_responded_at: now })
          .eq('id', apt.id)

        await sock.sendMessage(jid, { text: '❌ Randevunuz iptal edildi. İptalinizi aldık, iyi günler.' })

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

        // Bekleme listesi cascade tetikle
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/waiting-list/cascade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              psychologist_id: psychologistId,
              slot_date: apt.appointment_date,
            }),
          })
        } catch {}
      }
    }
  })
}

// ── Endpoints ─────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ ok: true }))

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
    // Bağlı değilse yeniden bağlanmayı tetikle — ama ikinci socket AÇMA
    if (statuses.get(psychologistId) === 'disconnected' || !sock) {
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
