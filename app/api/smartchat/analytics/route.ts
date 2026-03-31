import { NextResponse } from 'next/server'
import { getSmartchatAnalytics, parseAnalyticsRange } from '@/services/server/smartchat-analytics'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const range = parseAnalyticsRange(searchParams.get('range'))
    const recent = Number(searchParams.get('recent') || 30)
    const limitRecent = Number.isFinite(recent) ? Math.max(1, Math.min(recent, 500)) : 30
    const data = await getSmartchatAnalytics(limitRecent, range)
    return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown analytics error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
