const WA_URL = process.env.WA_SERVICE_URL!
const WA_KEY = process.env.WA_API_KEY!

function headers() {
  return { 'Content-Type': 'application/json', 'x-api-key': WA_KEY }
}

export async function waConnect(psychologistId: string) {
  const res = await fetch(`${WA_URL}/connect/${psychologistId}`, {
    method: 'POST',
    headers: headers(),
  })
  return res.json()
}

export async function waGetQR(psychologistId: string): Promise<{ status: string; qr: string | null }> {
  const res = await fetch(`${WA_URL}/qr/${psychologistId}`, {
    headers: headers(),
  })
  return res.json()
}

export async function waGetStatus(psychologistId: string): Promise<{ status: string; connected: boolean }> {
  const res = await fetch(`${WA_URL}/status/${psychologistId}`, {
    headers: headers(),
  })
  return res.json()
}

export async function waSendMessage(psychologistId: string, phone: string, message: string) {
  const res = await fetch(`${WA_URL}/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ psychologistId, phone, message }),
  })
  return res.json()
}

export async function waDisconnect(psychologistId: string) {
  const res = await fetch(`${WA_URL}/disconnect/${psychologistId}`, {
    method: 'POST',
    headers: headers(),
  })
  return res.json()
}
