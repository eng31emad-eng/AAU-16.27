import fs from 'fs'
import path from 'path'

export interface EvalLatency {
  avg: number
  p50: number
  p95: number
  max: number
}

export interface EvalSummary {
  datasetName: string
  datasetVersion: string
  endpoint: string
  startedAt: string
  finishedAt: string
  durationMs: number
  totalCases: number
  successCount: number
  errorCount: number
  successRate: number
  intentAccuracy: number
  keywordMatchRate: number
  sourceCoverageRate: number
  noAnswerPrecision: number
  citationRate: number
  hallucinationRiskRate: number
  latencyMs: EvalLatency
}

export interface EvalReport {
  summary: EvalSummary
  results?: Array<Record<string, any>>
}

export interface EvalReportSnapshot {
  fileName: string
  filePath: string
  createdAt: string
  summary: EvalSummary
}

export interface EvalMetricDelta {
  key: string
  label: string
  current: number
  previous: number
  delta: number
}

export interface SmartchatEvalDashboard {
  exists: boolean
  latest?: EvalReportSnapshot
  previous?: EvalReportSnapshot
  reports: EvalReportSnapshot[]
  deltas: EvalMetricDelta[]
}

const REPORTS_DIR = path.join(process.cwd(), 'data', 'eval', 'reports')

function toNumber(value: any, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function toText(value: any) {
  return String(value || '').trim()
}

function normalizeSummary(raw: any): EvalSummary {
  const latency = raw?.latencyMs || {}
  return {
    datasetName: toText(raw?.datasetName),
    datasetVersion: toText(raw?.datasetVersion),
    endpoint: toText(raw?.endpoint),
    startedAt: toText(raw?.startedAt),
    finishedAt: toText(raw?.finishedAt),
    durationMs: toNumber(raw?.durationMs),
    totalCases: toNumber(raw?.totalCases),
    successCount: toNumber(raw?.successCount),
    errorCount: toNumber(raw?.errorCount),
    successRate: toNumber(raw?.successRate),
    intentAccuracy: toNumber(raw?.intentAccuracy),
    keywordMatchRate: toNumber(raw?.keywordMatchRate),
    sourceCoverageRate: toNumber(raw?.sourceCoverageRate),
    noAnswerPrecision: toNumber(raw?.noAnswerPrecision),
    citationRate: toNumber(raw?.citationRate),
    hallucinationRiskRate: toNumber(raw?.hallucinationRiskRate),
    latencyMs: {
      avg: toNumber(latency?.avg),
      p50: toNumber(latency?.p50),
      p95: toNumber(latency?.p95),
      max: toNumber(latency?.max),
    },
  }
}

function parseReport(filePath: string): EvalReportSnapshot | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as EvalReport
    const summary = normalizeSummary(parsed?.summary || {})
    const stat = fs.statSync(filePath)
    return {
      fileName: path.basename(filePath),
      filePath,
      createdAt: stat.mtime.toISOString(),
      summary,
    }
  } catch {
    return null
  }
}

function buildDelta(current: EvalSummary, previous: EvalSummary): EvalMetricDelta[] {
  const rows: Array<{ key: string; label: string; current: number; previous: number }> = [
    { key: 'successRate', label: 'Success Rate', current: current.successRate, previous: previous.successRate },
    { key: 'intentAccuracy', label: 'Intent Accuracy', current: current.intentAccuracy, previous: previous.intentAccuracy },
    { key: 'keywordMatchRate', label: 'Keyword Match Rate', current: current.keywordMatchRate, previous: previous.keywordMatchRate },
    { key: 'sourceCoverageRate', label: 'Source Coverage', current: current.sourceCoverageRate, previous: previous.sourceCoverageRate },
    { key: 'noAnswerPrecision', label: 'No-Answer Precision', current: current.noAnswerPrecision, previous: previous.noAnswerPrecision },
    { key: 'citationRate', label: 'Citation Rate', current: current.citationRate, previous: previous.citationRate },
    { key: 'hallucinationRiskRate', label: 'Hallucination Risk', current: current.hallucinationRiskRate, previous: previous.hallucinationRiskRate },
    { key: 'latencyP95', label: 'Latency p95 (ms)', current: current.latencyMs.p95, previous: previous.latencyMs.p95 },
  ]

  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    current: row.current,
    previous: row.previous,
    delta: row.current - row.previous,
  }))
}

export async function getSmartchatEvalDashboard(limit = 12): Promise<SmartchatEvalDashboard> {
  if (!fs.existsSync(REPORTS_DIR)) {
    return { exists: false, reports: [], deltas: [] }
  }

  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((name) => name.startsWith('smartchat-eval-') && name.endsWith('.json'))
    .map((name) => path.join(REPORTS_DIR, name))
    .sort((a, b) => {
      const ta = fs.statSync(a).mtime.getTime()
      const tb = fs.statSync(b).mtime.getTime()
      return tb - ta
    })
    .slice(0, Math.max(1, limit))

  const reports = files.map(parseReport).filter(Boolean) as EvalReportSnapshot[]
  if (!reports.length) {
    return { exists: false, reports: [], deltas: [] }
  }

  const latest = reports[0]
  const previous = reports[1]
  const deltas = latest && previous ? buildDelta(latest.summary, previous.summary) : []

  return {
    exists: true,
    latest,
    previous,
    reports,
    deltas,
  }
}
