import { NextResponse } from 'next/server'
import { getSmartchatAnalyticsCsv, parseAnalyticsRange } from '@/services/server/smartchat-analytics'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const range = parseAnalyticsRange(searchParams.get('range'))
    const csv = await getSmartchatAnalyticsCsv(range)
    const fileName = `smartchat-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown export error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
