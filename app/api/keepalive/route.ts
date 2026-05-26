import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const waUrl = process.env.WA_SERVICE_URL
  let waStatus = 'skipped'

  if (waUrl) {
    try {
      const res = await fetch(`${waUrl}/health`, {
        headers: { 'x-api-key': process.env.WA_API_KEY ?? '' },
        signal: AbortSignal.timeout(5000),
      })
      waStatus = res.ok ? 'ok' : `http_${res.status}`
    } catch {
      waStatus = 'error'
    }
  }

  return NextResponse.json({ ok: true, wa: waStatus, ts: new Date().toISOString() })
}
