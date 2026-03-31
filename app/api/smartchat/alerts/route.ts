import { NextResponse } from 'next/server'
import { dispatchSmartchatQualityAlert, getSmartchatAlertState } from '@/services/server/smartchat-alerts'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const state = getSmartchatAlertState()
    const configured = Boolean(String(process.env.SMARTCHAT_ALERT_WEBHOOK_URL || '').trim())
    return NextResponse.json(
      {
        ok: true,
        configured,
        minLevel: process.env.SMARTCHAT_ALERT_MIN_LEVEL || 'critical',
        cooldownMinutes: Number(process.env.SMARTCHAT_ALERT_COOLDOWN_MINUTES || 60),
        state,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown alert status error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const result = await dispatchSmartchatQualityAlert()
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown alert trigger error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
