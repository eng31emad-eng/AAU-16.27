import fs from 'fs'
import path from 'path'
import { getSmartchatAnalytics } from '@/services/server/smartchat-analytics'

type AlertLevel = 'none' | 'warning' | 'critical'

interface SmartchatAlertState {
  lastAlertAt?: string
  lastAlertLevel?: AlertLevel
  lastAlertRange?: string
  lastAlertMessage?: string
  lastAlertSignature?: string
}

interface DispatchResult {
  checked: boolean
  sent: boolean
  reason?: string
  level: AlertLevel
}

const ANALYTICS_DIR = path.join(process.cwd(), 'data', 'analytics')
const ALERT_STATE_PATH = path.join(ANALYTICS_DIR, 'smartchat-alert-state.json')
const ALERT_LOG_PATH = path.join(ANALYTICS_DIR, 'smartchat-alerts.jsonl')

function normalizeLevel(raw: string | undefined): AlertLevel {
  if (raw === 'warning' || raw === 'critical' || raw === 'none') return raw
  return 'critical'
}

function levelOrder(level: AlertLevel) {
  if (level === 'critical') return 2
  if (level === 'warning') return 1
  return 0
}

function readState(): SmartchatAlertState {
  try {
    if (!fs.existsSync(ALERT_STATE_PATH)) return {}
    return JSON.parse(fs.readFileSync(ALERT_STATE_PATH, 'utf8')) as SmartchatAlertState
  } catch {
    return {}
  }
}

function writeState(state: SmartchatAlertState) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true })
  fs.writeFileSync(ALERT_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

function appendAlertLog(payload: Record<string, any>) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true })
  fs.appendFileSync(ALERT_LOG_PATH, `${JSON.stringify(payload)}\n`, 'utf8')
}

function buildSignature(level: AlertLevel, negativeRate: number, totalFeedback: number, firstIntent: string) {
  return `${level}:${negativeRate.toFixed(3)}:${totalFeedback}:${firstIntent || 'none'}`
}

function buildWebhookPayload(snapshot: any, level: AlertLevel) {
  const topIntent = snapshot.topNegativeIntents?.[0]
  return {
    source: 'aau-smartchat',
    event: 'quality_alert',
    level,
    message: snapshot.alertMessage,
    range: snapshot.range,
    timestamp: new Date().toISOString(),
    metrics: {
      totalFeedback: snapshot.totalFeedback,
      positiveFeedback: snapshot.positiveFeedback,
      negativeFeedback: snapshot.negativeFeedback,
      satisfactionRate: snapshot.satisfactionRate,
      negativeRate: snapshot.negativeRate,
      averageConfidence: snapshot.averageConfidence,
    },
    topNegativeIntent: topIntent
      ? {
        intent: topIntent.intent,
        negative: topIntent.negative,
        total: topIntent.total,
        satisfactionRate: topIntent.satisfactionRate,
      }
      : null,
    topSuggestions: Array.isArray(snapshot.topSuggestions)
      ? snapshot.topSuggestions.slice(0, 3)
      : [],
  }
}

export function getSmartchatAlertState() {
  return readState()
}

export async function dispatchSmartchatQualityAlert(): Promise<DispatchResult> {
  const webhookUrl = String(process.env.SMARTCHAT_ALERT_WEBHOOK_URL || '').trim()
  const minLevel = normalizeLevel(process.env.SMARTCHAT_ALERT_MIN_LEVEL)
  const cooldownMinutes = Math.max(Number(process.env.SMARTCHAT_ALERT_COOLDOWN_MINUTES || 60), 1)

  const snapshot = await getSmartchatAnalytics(120, '24h')
  const level = snapshot.alertLevel as AlertLevel
  if (!webhookUrl) {
    return { checked: true, sent: false, reason: 'webhook_not_configured', level }
  }

  if (levelOrder(level) < levelOrder(minLevel)) {
    return { checked: true, sent: false, reason: 'below_min_level', level }
  }

  const state = readState()
  const nowMs = Date.now()
  const lastTs = state.lastAlertAt ? new Date(state.lastAlertAt).getTime() : 0
  const elapsedMinutes = lastTs > 0 ? (nowMs - lastTs) / 60000 : Number.POSITIVE_INFINITY
  const topIntent = snapshot.topNegativeIntents?.[0]?.intent || ''
  const signature = buildSignature(level, snapshot.negativeRate, snapshot.totalFeedback, topIntent)

  if (state.lastAlertSignature === signature && elapsedMinutes < cooldownMinutes) {
    return { checked: true, sent: false, reason: 'cooldown_active_same_signature', level }
  }

  if (elapsedMinutes < cooldownMinutes && level !== 'critical') {
    return { checked: true, sent: false, reason: 'cooldown_active', level }
  }

  const payload = buildWebhookPayload(snapshot, level)
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    appendAlertLog({
      ts: new Date().toISOString(),
      status: 'failed',
      level,
      reason: `webhook_http_${response.status}`,
      response: text.slice(0, 400),
      payload,
    })
    return { checked: true, sent: false, reason: `webhook_http_${response.status}`, level }
  }

  const nextState: SmartchatAlertState = {
    lastAlertAt: new Date().toISOString(),
    lastAlertLevel: level,
    lastAlertRange: snapshot.range,
    lastAlertMessage: snapshot.alertMessage,
    lastAlertSignature: signature,
  }
  writeState(nextState)
  appendAlertLog({
    ts: nextState.lastAlertAt,
    status: 'sent',
    level,
    payload,
  })

  return { checked: true, sent: true, level }
}
