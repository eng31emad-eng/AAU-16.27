#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const reportsDir = process.env.SMARTCHAT_EVAL_REPORTS_DIR || path.join(process.cwd(), 'data', 'eval', 'reports')
const thresholdPath = process.env.SMARTCHAT_EVAL_THRESHOLDS || path.join(process.cwd(), 'data', 'eval', 'smartchat_eval_thresholds.json')
const explicitReportPath = process.env.SMARTCHAT_EVAL_REPORT || ''

function toNum(value, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function findLatestReports(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.startsWith('smartchat-eval-') && name.endsWith('.json'))
    .map((name) => path.join(dirPath, name))
    .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime())
}

function readSummary(filePath) {
  const payload = loadJson(filePath)
  return payload?.summary || {}
}

function fail(lines) {
  console.error('=== Smart Chat Quality Gate: FAILED ===')
  for (const line of lines) console.error(`- ${line}`)
  process.exit(1)
}

function pass(lines) {
  console.log('=== Smart Chat Quality Gate: PASSED ===')
  for (const line of lines) console.log(`- ${line}`)
}

function main() {
  if (!fs.existsSync(thresholdPath)) {
    fail([`Threshold file not found: ${thresholdPath}`])
  }

  const thresholds = loadJson(thresholdPath)
  const reports = findLatestReports(reportsDir)
  const latestReportPath = explicitReportPath || reports[0]
  const previousReportPath = reports[1]

  if (!latestReportPath || !fs.existsSync(latestReportPath)) {
    fail([
      `No evaluation report found in ${reportsDir}`,
      'Run `npm run eval:smartchat` first.',
    ])
  }

  const summary = readSummary(latestReportPath)
  const previous = previousReportPath && fs.existsSync(previousReportPath)
    ? readSummary(previousReportPath)
    : null

  const errors = []
  const notes = []

  const totalCases = toNum(summary.totalCases)
  const errorCount = toNum(summary.errorCount)
  const latencyP95 = toNum(summary?.latencyMs?.p95)

  if (totalCases < toNum(thresholds.minCases, 1)) {
    errors.push(`totalCases=${totalCases} < minCases=${thresholds.minCases}`)
  }
  if (errorCount > toNum(thresholds.maxErrorCount, 0)) {
    errors.push(`errorCount=${errorCount} > maxErrorCount=${thresholds.maxErrorCount}`)
  }

  const minMetrics = thresholds.minMetrics || {}
  for (const [key, minValueRaw] of Object.entries(minMetrics)) {
    const minValue = toNum(minValueRaw)
    const actual = toNum(summary[key])
    if (actual < minValue) {
      errors.push(`${key}=${actual.toFixed(4)} < min=${minValue.toFixed(4)}`)
    } else {
      notes.push(`${key}=${actual.toFixed(4)} (min ${minValue.toFixed(4)})`)
    }
  }

  const maxMetrics = thresholds.maxMetrics || {}
  if (maxMetrics.hallucinationRiskRate !== undefined) {
    const maxValue = toNum(maxMetrics.hallucinationRiskRate)
    const actual = toNum(summary.hallucinationRiskRate)
    if (actual > maxValue) {
      errors.push(`hallucinationRiskRate=${actual.toFixed(4)} > max=${maxValue.toFixed(4)}`)
    } else {
      notes.push(`hallucinationRiskRate=${actual.toFixed(4)} (max ${maxValue.toFixed(4)})`)
    }
  }
  if (maxMetrics.latencyP95Ms !== undefined) {
    const maxValue = toNum(maxMetrics.latencyP95Ms)
    if (latencyP95 > maxValue) {
      errors.push(`latencyP95Ms=${latencyP95.toFixed(0)} > max=${maxValue.toFixed(0)}`)
    } else {
      notes.push(`latencyP95Ms=${latencyP95.toFixed(0)} (max ${maxValue.toFixed(0)})`)
    }
  }

  const regression = thresholds.regression || {}
  const regressionEnabled = Boolean(regression.enabled)
  if (regressionEnabled && previous) {
    const maxDrop = regression.maxDrop || {}
    for (const [key, allowedDropRaw] of Object.entries(maxDrop)) {
      const allowedDrop = toNum(allowedDropRaw)
      const current = toNum(summary[key])
      const prev = toNum(previous[key])
      const drop = prev - current
      if (drop > allowedDrop) {
        errors.push(`${key} regressed by ${drop.toFixed(4)} > allowed ${allowedDrop.toFixed(4)}`)
      } else {
        notes.push(`${key} delta=${(current - prev).toFixed(4)} (allowed drop ${allowedDrop.toFixed(4)})`)
      }
    }

    const maxIncrease = regression.maxIncrease || {}
    if (maxIncrease.hallucinationRiskRate !== undefined) {
      const allowedInc = toNum(maxIncrease.hallucinationRiskRate)
      const current = toNum(summary.hallucinationRiskRate)
      const prev = toNum(previous.hallucinationRiskRate)
      const inc = current - prev
      if (inc > allowedInc) {
        errors.push(`hallucinationRiskRate increased by ${inc.toFixed(4)} > allowed ${allowedInc.toFixed(4)}`)
      } else {
        notes.push(`hallucinationRiskRate delta=${inc.toFixed(4)} (allowed +${allowedInc.toFixed(4)})`)
      }
    }
    if (maxIncrease.latencyP95Ms !== undefined) {
      const allowedInc = toNum(maxIncrease.latencyP95Ms)
      const current = toNum(summary?.latencyMs?.p95)
      const prev = toNum(previous?.latencyMs?.p95)
      const inc = current - prev
      if (inc > allowedInc) {
        errors.push(`latencyP95Ms increased by ${inc.toFixed(0)} > allowed ${allowedInc.toFixed(0)}`)
      } else {
        notes.push(`latencyP95Ms delta=${inc.toFixed(0)} (allowed +${allowedInc.toFixed(0)})`)
      }
    }
  } else if (regressionEnabled) {
    notes.push('Regression check skipped (no previous report).')
  }

  notes.unshift(`Latest report: ${path.basename(latestReportPath)}`)
  if (previousReportPath) notes.unshift(`Previous report: ${path.basename(previousReportPath)}`)
  notes.unshift(`Thresholds: ${path.basename(thresholdPath)}`)

  if (errors.length) {
    fail([...notes, ...errors])
  }
  pass(notes)
}

main()
