#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const endpoint = process.env.SMARTCHAT_EVAL_ENDPOINT || 'http://127.0.0.1:3000/api/smartchat'
const datasetPath = process.env.SMARTCHAT_EVAL_DATASET || path.join(process.cwd(), 'data', 'eval', 'smartchat_eval_dataset.json')
const timeoutMs = Number(process.env.SMARTCHAT_EVAL_TIMEOUT_MS || 30000)

function nowIso() {
  return new Date().toISOString()
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function includesAny(text, keywords = []) {
  const normalized = normalizeText(text)
  return keywords.some((k) => normalized.includes(normalizeText(k)))
}

function isNoAnswer(text) {
  const normalized = normalizeText(text)
  const patterns = [
    'لا أجد إجابة',
    'لا اعرف',
    'لا أعرف',
    'لا تتوفر',
    'ضمن البيانات المتاحة',
    'لا املك معلومة',
  ]
  return includesAny(normalized, patterns)
}

function percentile(values, p) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

async function postJsonWithTimeout(url, body, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))
    return { ok: response.ok, status: response.status, data }
  } finally {
    clearTimeout(timer)
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

async function main() {
  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found: ${datasetPath}`)
    process.exit(1)
  }

  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'))
  const cases = Array.isArray(dataset?.cases) ? dataset.cases : []
  if (!cases.length) {
    console.error('Dataset has no test cases.')
    process.exit(1)
  }

  const runId = nowIso().replace(/[:.]/g, '-')
  const startedAt = Date.now()
  const results = []
  const latencies = []

  let okCount = 0
  let errorCount = 0
  let intentChecks = 0
  let intentMatches = 0
  let keywordChecks = 0
  let keywordMatches = 0
  let requiredSourceChecks = 0
  let requiredSourceMatches = 0
  let noAnswerChecks = 0
  let noAnswerMatches = 0
  let citationCount = 0
  let hallucinationRiskCount = 0

  for (const item of cases) {
    const q = String(item?.question || '').trim()
    const history = Array.isArray(item?.history) ? item.history : []
    const expectedIntent = item?.expectedIntent ? String(item.expectedIntent) : ''
    const expectedKeywords = Array.isArray(item?.expectedAnswerKeywords) ? item.expectedAnswerKeywords.map(String) : []
    const requireSources = Boolean(item?.requireSources)
    const expectNoAnswer = Boolean(item?.expectNoAnswer)

    if (!q) continue

    const t0 = Date.now()
    let call
    let latencyMs = 0
    try {
      call = await postJsonWithTimeout(endpoint, { question: q, history }, timeoutMs)
      latencyMs = Date.now() - t0
      latencies.push(latencyMs)
    } catch (error) {
      latencyMs = Date.now() - t0
      latencies.push(latencyMs)
      errorCount += 1
      results.push({
        id: item?.id || `case-${results.length + 1}`,
        question: q,
        latencyMs,
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown request error',
      })
      continue
    }

    const response = call?.data || {}
    const answer = String(response?.answer || '')
    const sources = Array.isArray(response?.sources) ? response.sources : []
    const intent = String(response?.intent || '')
    const hasSources = sources.length > 0
    const noAnswerDetected = isNoAnswer(answer)

    if (call.ok) okCount += 1
    else errorCount += 1

    if (expectedIntent) {
      intentChecks += 1
      if (intent === expectedIntent) intentMatches += 1
    }

    if (expectedKeywords.length > 0 && !expectNoAnswer) {
      keywordChecks += 1
      if (includesAny(answer, expectedKeywords)) keywordMatches += 1
    }

    if (requireSources) {
      requiredSourceChecks += 1
      if (hasSources) requiredSourceMatches += 1
    }

    if (expectNoAnswer) {
      noAnswerChecks += 1
      if (noAnswerDetected) noAnswerMatches += 1
    }

    if (hasSources) citationCount += 1
    if (!hasSources && !noAnswerDetected && intent === 'university') hallucinationRiskCount += 1

    results.push({
      id: item?.id || `case-${results.length + 1}`,
      question: q,
      expectedIntent,
      actualIntent: intent,
      expectedKeywords,
      answer,
      sourceCount: sources.length,
      confidence: response?.confidence,
      traceId: response?.traceId,
      latencyMs,
      checks: {
        intentMatch: expectedIntent ? intent === expectedIntent : null,
        keywordMatch: expectedKeywords.length > 0 && !expectNoAnswer ? includesAny(answer, expectedKeywords) : null,
        requireSources,
        hasSources,
        expectNoAnswer,
        noAnswerDetected,
      },
    })
  }

  const total = results.length
  const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0
  const summary = {
    datasetName: dataset?.name || 'unknown',
    datasetVersion: dataset?.version || '',
    endpoint,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: nowIso(),
    durationMs: Date.now() - startedAt,
    totalCases: total,
    successCount: okCount,
    errorCount,
    successRate: total > 0 ? okCount / total : 0,
    intentAccuracy: intentChecks > 0 ? intentMatches / intentChecks : 0,
    keywordMatchRate: keywordChecks > 0 ? keywordMatches / keywordChecks : 0,
    sourceCoverageRate: requiredSourceChecks > 0 ? requiredSourceMatches / requiredSourceChecks : 0,
    noAnswerPrecision: noAnswerChecks > 0 ? noAnswerMatches / noAnswerChecks : 0,
    citationRate: total > 0 ? citationCount / total : 0,
    hallucinationRiskRate: total > 0 ? hallucinationRiskCount / total : 0,
    latencyMs: {
      avg: Number(avgLatency.toFixed(2)),
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      max: latencies.length ? Math.max(...latencies) : 0,
    },
  }

  const report = { summary, results }
  const reportsDir = path.join(process.cwd(), 'data', 'eval', 'reports')
  ensureDir(reportsDir)
  const reportPath = path.join(reportsDir, `smartchat-eval-${runId}.json`)
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log('=== Smart Chat Eval Summary ===')
  console.log(`Dataset: ${summary.datasetName} (${summary.datasetVersion})`)
  console.log(`Endpoint: ${summary.endpoint}`)
  console.log(`Cases: ${summary.totalCases}, Success: ${summary.successCount}, Errors: ${summary.errorCount}`)
  console.log(`Intent Accuracy: ${(summary.intentAccuracy * 100).toFixed(1)}%`)
  console.log(`Keyword Match Rate: ${(summary.keywordMatchRate * 100).toFixed(1)}%`)
  console.log(`Source Coverage Rate: ${(summary.sourceCoverageRate * 100).toFixed(1)}%`)
  console.log(`No-Answer Precision: ${(summary.noAnswerPrecision * 100).toFixed(1)}%`)
  console.log(`Citation Rate: ${(summary.citationRate * 100).toFixed(1)}%`)
  console.log(`Hallucination Risk Rate: ${(summary.hallucinationRiskRate * 100).toFixed(1)}%`)
  console.log(`Latency p50/p95: ${summary.latencyMs.p50}ms / ${summary.latencyMs.p95}ms`)
  console.log(`Report: ${reportPath}`)

  if (summary.errorCount > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
