import fs from 'fs'
import path from 'path'

export type FeedbackValue = 'up' | 'down'
export type FeedbackType = 'answer_feedback' | 'suggestion_click'

export interface SmartchatFeedbackEvent {
  ts: string
  type: FeedbackType
  value?: FeedbackValue
  traceId?: string
  intent?: string
  confidence?: number
  answer?: string
  suggestion?: string
  userAgent?: string
  referer?: string
}

export interface IntentFeedbackStat {
  intent: string
  total: number
  positive: number
  negative: number
  satisfactionRate: number
}

export interface SuggestionClickStat {
  suggestion: string
  clicks: number
}

export interface SmartchatAnalyticsSnapshot {
  exists: boolean
  range: AnalyticsRange
  rangeLabel: string
  fromTs?: string
  toTs?: string
  totalEvents: number
  totalFeedback: number
  totalSuggestionClicks: number
  positiveFeedback: number
  negativeFeedback: number
  satisfactionRate: number
  negativeRate: number
  averageConfidence: number
  alertLevel: 'none' | 'warning' | 'critical'
  alertMessage: string
  topNegativeIntents: IntentFeedbackStat[]
  topSuggestions: SuggestionClickStat[]
  recentEvents: SmartchatFeedbackEvent[]
}

const FEEDBACK_LOG_PATH = path.join(process.cwd(), 'data', 'analytics', 'smartchat-feedback.jsonl')
export type AnalyticsRange = '24h' | '7d' | '30d' | 'all'

function clampNumber(value: any, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizeText(value: any) {
  return String(value || '').trim()
}

function parseEvent(line: string): SmartchatFeedbackEvent | null {
  if (!line.trim()) return null
  try {
    const parsed = JSON.parse(line)
    const type = normalizeText(parsed?.type)
    if (type !== 'answer_feedback' && type !== 'suggestion_click') return null

    const value = normalizeText(parsed?.value)
    const feedbackValue = value === 'up' || value === 'down' ? value : undefined

    return {
      ts: normalizeText(parsed?.ts),
      type,
      value: feedbackValue,
      traceId: normalizeText(parsed?.traceId),
      intent: normalizeText(parsed?.intent),
      confidence: parsed?.confidence !== undefined ? clampNumber(parsed.confidence) : undefined,
      answer: normalizeText(parsed?.answer),
      suggestion: normalizeText(parsed?.suggestion),
      userAgent: normalizeText(parsed?.userAgent),
      referer: normalizeText(parsed?.referer),
    }
  } catch {
    return null
  }
}

function emptySnapshot(exists = false): SmartchatAnalyticsSnapshot {
  return {
    exists,
    range: 'all',
    rangeLabel: 'All time',
    totalEvents: 0,
    totalFeedback: 0,
    totalSuggestionClicks: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    satisfactionRate: 0,
    negativeRate: 0,
    averageConfidence: 0,
    alertLevel: 'none',
    alertMessage: '',
    topNegativeIntents: [],
    topSuggestions: [],
    recentEvents: [],
  }
}

function normalizeRange(raw: string | null | undefined): AnalyticsRange {
  if (raw === '24h' || raw === '7d' || raw === '30d' || raw === 'all') return raw
  return 'all'
}

function rangeLabel(range: AnalyticsRange) {
  if (range === '24h') return 'Last 24 hours'
  if (range === '7d') return 'Last 7 days'
  if (range === '30d') return 'Last 30 days'
  return 'All time'
}

function rangeStartMs(range: AnalyticsRange, now = Date.now()) {
  if (range === '24h') return now - 24 * 60 * 60 * 1000
  if (range === '7d') return now - 7 * 24 * 60 * 60 * 1000
  if (range === '30d') return now - 30 * 24 * 60 * 60 * 1000
  return 0
}

function computeAlert(totalFeedback: number, negativeRate: number) {
  if (totalFeedback < 15) {
    return { level: 'none' as const, message: '' }
  }
  if (negativeRate >= 0.45) {
    return { level: 'critical' as const, message: 'High negative feedback rate. Review failing intents immediately.' }
  }
  if (negativeRate >= 0.3) {
    return { level: 'warning' as const, message: 'Negative feedback is rising. Track top intents and improve retrieval quality.' }
  }
  return { level: 'none' as const, message: '' }
}

export async function getSmartchatAnalytics(
  limitRecent = 20,
  requestedRange: AnalyticsRange = 'all'
): Promise<SmartchatAnalyticsSnapshot> {
  if (!fs.existsSync(FEEDBACK_LOG_PATH)) {
    const base = emptySnapshot(false)
    return { ...base, range: requestedRange, rangeLabel: rangeLabel(requestedRange) }
  }

  const lines = fs.readFileSync(FEEDBACK_LOG_PATH, 'utf8').split(/\r?\n/)
  const allEvents = lines.map(parseEvent).filter(Boolean) as SmartchatFeedbackEvent[]
  const now = Date.now()
  const range = normalizeRange(requestedRange)
  const fromMs = rangeStartMs(range, now)

  const events = allEvents.filter((event) => {
    if (!event.ts) return false
    const tsMs = new Date(event.ts).getTime()
    if (Number.isNaN(tsMs)) return false
    if (range === 'all') return true
    return tsMs >= fromMs
  })

  if (events.length === 0) {
    const base = emptySnapshot(true)
    return {
      ...base,
      range,
      rangeLabel: rangeLabel(range),
      fromTs: range === 'all' ? undefined : new Date(fromMs).toISOString(),
      toTs: new Date(now).toISOString(),
    }
  }

  let totalFeedback = 0
  let totalSuggestionClicks = 0
  let positiveFeedback = 0
  let negativeFeedback = 0
  let confidenceSum = 0
  let confidenceCount = 0

  const intentMap = new Map<string, { total: number; positive: number; negative: number }>()
  const suggestionMap = new Map<string, number>()

  for (const event of events) {
    if (event.type === 'answer_feedback') {
      totalFeedback += 1
      if (event.value === 'up') positiveFeedback += 1
      if (event.value === 'down') negativeFeedback += 1

      if (typeof event.confidence === 'number') {
        confidenceSum += event.confidence
        confidenceCount += 1
      }

      const intent = event.intent || 'unknown'
      const current = intentMap.get(intent) || { total: 0, positive: 0, negative: 0 }
      current.total += 1
      if (event.value === 'up') current.positive += 1
      if (event.value === 'down') current.negative += 1
      intentMap.set(intent, current)
    } else if (event.type === 'suggestion_click') {
      totalSuggestionClicks += 1
      const suggestion = event.suggestion || 'unknown'
      suggestionMap.set(suggestion, (suggestionMap.get(suggestion) || 0) + 1)
    }
  }

  const satisfactionRate = totalFeedback > 0 ? positiveFeedback / totalFeedback : 0
  const negativeRate = totalFeedback > 0 ? negativeFeedback / totalFeedback : 0
  const averageConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0
  const alert = computeAlert(totalFeedback, negativeRate)

  const topNegativeIntents: IntentFeedbackStat[] = [...intentMap.entries()]
    .map(([intent, values]) => ({
      intent,
      total: values.total,
      positive: values.positive,
      negative: values.negative,
      satisfactionRate: values.total > 0 ? values.positive / values.total : 0,
    }))
    .sort((a, b) => {
      if (b.negative !== a.negative) return b.negative - a.negative
      return a.satisfactionRate - b.satisfactionRate
    })
    .slice(0, 8)

  const topSuggestions: SuggestionClickStat[] = [...suggestionMap.entries()]
    .map(([suggestion, clicks]) => ({ suggestion, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  const recentEvents = [...events]
    .sort((a, b) => {
      const ta = new Date(a.ts).getTime()
      const tb = new Date(b.ts).getTime()
      return tb - ta
    })
    .slice(0, Math.max(1, limitRecent))

  return {
    exists: true,
    range,
    rangeLabel: rangeLabel(range),
    fromTs: range === 'all' ? undefined : new Date(fromMs).toISOString(),
    toTs: new Date(now).toISOString(),
    totalEvents: events.length,
    totalFeedback,
    totalSuggestionClicks,
    positiveFeedback,
    negativeFeedback,
    satisfactionRate,
    negativeRate,
    averageConfidence,
    alertLevel: alert.level,
    alertMessage: alert.message,
    topNegativeIntents,
    topSuggestions,
    recentEvents,
  }
}

export async function getSmartchatAnalyticsCsv(
  requestedRange: AnalyticsRange = 'all'
) {
  const snapshot = await getSmartchatAnalytics(500, requestedRange)
  const lines: string[] = []
  const esc = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

  lines.push(['metric', 'value'].map(esc).join(','))
  lines.push(['range', snapshot.range].map(esc).join(','))
  lines.push(['rangeLabel', snapshot.rangeLabel].map(esc).join(','))
  lines.push(['totalEvents', snapshot.totalEvents].map(esc).join(','))
  lines.push(['totalFeedback', snapshot.totalFeedback].map(esc).join(','))
  lines.push(['positiveFeedback', snapshot.positiveFeedback].map(esc).join(','))
  lines.push(['negativeFeedback', snapshot.negativeFeedback].map(esc).join(','))
  lines.push(['satisfactionRate', snapshot.satisfactionRate.toFixed(4)].map(esc).join(','))
  lines.push(['negativeRate', snapshot.negativeRate.toFixed(4)].map(esc).join(','))
  lines.push(['averageConfidence', snapshot.averageConfidence.toFixed(4)].map(esc).join(','))
  lines.push(['alertLevel', snapshot.alertLevel].map(esc).join(','))
  lines.push(['alertMessage', snapshot.alertMessage].map(esc).join(','))
  lines.push('')

  lines.push(['intent', 'total', 'positive', 'negative', 'satisfactionRate'].map(esc).join(','))
  for (const intent of snapshot.topNegativeIntents) {
    lines.push(
      [intent.intent, intent.total, intent.positive, intent.negative, intent.satisfactionRate.toFixed(4)]
        .map(esc)
        .join(',')
    )
  }
  lines.push('')

  lines.push(['suggestion', 'clicks'].map(esc).join(','))
  for (const suggestion of snapshot.topSuggestions) {
    lines.push([suggestion.suggestion, suggestion.clicks].map(esc).join(','))
  }
  lines.push('')

  lines.push(['ts', 'type', 'value', 'intent', 'confidence', 'traceId', 'suggestion'].map(esc).join(','))
  for (const event of snapshot.recentEvents) {
    lines.push(
      [event.ts, event.type, event.value || '', event.intent || '', event.confidence ?? '', event.traceId || '', event.suggestion || '']
        .map(esc)
        .join(',')
    )
  }

  return `\uFEFF${lines.join('\n')}\n`
}

export function parseAnalyticsRange(raw: string | null | undefined): AnalyticsRange {
  return normalizeRange(raw)
}
