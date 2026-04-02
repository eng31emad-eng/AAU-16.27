import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { saveKbIndex } from '@/lib/kb-store'

type SourceFaq = {
  id: string
  question: string
  answer: string
  category: string
  isPublished: boolean
  displayOrder: number
  updatedAt: string
}

export type SmartchatReindexState = {
  lastRunAt?: string
  lastSuccessAt?: string
  lastDurationMs?: number
  lastCount?: number
  lastHash?: string
  sourceUrl?: string
  lastReason?: string
  lastError?: string
}

export type SmartchatReindexResult = {
  ok: boolean
  updated: boolean
  reason: string
  count: number
  storage?: 'supabase' | 'file'
  hash?: string
  durationMs: number
  sourceUrl?: string
  state: SmartchatReindexState
  error?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const STATE_PATH = path.join(DATA_DIR, 'kb_sync_state.json')
const DEFAULT_BASE_URL = (
  process.env.AAU_API_BASE_URL ||
  process.env.NEXT_PUBLIC_AAU_API_BASE_URL ||
  'https://edu.yemenfrappe.com'
).replace(/\/$/, '')
const FAQ_SOURCE_PATH = process.env.SMARTCHAT_FAQ_SOURCE_PATH || '/api/faqs'
const INCLUDE_UNPUBLISHED = String(process.env.SMARTCHAT_REINDEX_INCLUDE_UNPUBLISHED || '').trim() === '1'
const SOURCE_TIMEOUT_MS = Math.max(Number(process.env.SMARTCHAT_REINDEX_TIMEOUT_MS || 25000), 5000)
const EMBEDDING_MODEL = 'gemini-embedding-001'
const EMBEDDING_BATCH_SIZE = Math.max(Number(process.env.SMARTCHAT_REINDEX_EMBEDDING_BATCH_SIZE || 4), 1)
const EMBEDDING_BATCH_DELAY_MS = Math.max(Number(process.env.SMARTCHAT_REINDEX_EMBEDDING_BATCH_DELAY_MS || 180), 0)

let runningPromise: Promise<SmartchatReindexResult> | null = null

function normalizeString(value: unknown) {
  return String(value || '').trim()
}

function normalizeNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeBoolean(value: unknown) {
  if (value === true || value === 1 || value === '1') return true
  return false
}

function unwrapPayload(payload: any) {
  if (payload?.ok === true && payload?.data !== undefined) return payload.data
  if (payload?.message?.ok === true && payload?.message?.data !== undefined) return payload.message.data
  if (payload?.data !== undefined) return payload.data
  if (payload?.message !== undefined) return payload.message
  return payload
}

function readState(): SmartchatReindexState {
  try {
    if (!fs.existsSync(STATE_PATH)) return {}
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) as SmartchatReindexState
  } catch {
    return {}
  }
}

function writeState(state: SmartchatReindexState) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

function buildSourceUrl(baseUrl: string) {
  return `${baseUrl}${FAQ_SOURCE_PATH}`
}

function normalizeFaqRows(rows: any[]): SourceFaq[] {
  return rows
    .map((row, index) => {
      const id = normalizeString(row?.id || row?.docname || row?.name || `faq-${index + 1}`)
      const question = normalizeString(row?.questionAr || row?.question || row?.title || row?.questionEn)
      const answer = normalizeString(row?.answerAr || row?.answer || row?.content || row?.answerEn)
      const category = normalizeString(row?.category)
      const isPublished = normalizeBoolean(row?.isPublished ?? row?.published ?? 1)
      const displayOrder = normalizeNumber(row?.displayOrder)
      const updatedAt = normalizeString(row?.updatedAt || row?.modified || row?.updated_at)
      return {
        id,
        question,
        answer,
        category,
        isPublished,
        displayOrder,
        updatedAt,
      }
    })
    .filter((item) => item.question && item.answer && (INCLUDE_UNPUBLISHED || item.isPublished))
    .sort((a, b) => {
      const byOrder = a.displayOrder - b.displayOrder
      if (byOrder !== 0) return byOrder
      return a.id.localeCompare(b.id)
    })
}

function buildHash(rows: SourceFaq[]) {
  const hashSource = rows.map((row) => ({
    id: row.id,
    q: row.question,
    a: row.answer,
    c: row.category,
    p: row.isPublished,
    u: row.updatedAt,
  }))
  return crypto.createHash('sha256').update(JSON.stringify(hashSource)).digest('hex')
}

async function fetchFaqRows(sourceUrl: string): Promise<SourceFaq[]> {
  console.log('[reindex] fetching FAQ source:', sourceUrl)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS)
  try {
    const response = await fetch(sourceUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`FAQ source request failed: HTTP ${response.status}`)
    }
    console.log('[reindex] FAQ source status:', response.status)
    const payload = await response.json()
    const unwrapped = unwrapPayload(payload)
    if (!Array.isArray(unwrapped)) {
      console.error('[reindex] FAQ payload is not an array', unwrapped)
      throw new Error('FAQ source payload is not an array')
    }
    console.log('[reindex] FAQ payload array length:', unwrapped.length)
    return normalizeFaqRows(unwrapped)
  } finally {
    clearTimeout(timeout)
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildEmbeddingText(row: { question: string; answer: string }) {
  return `${row.question}\n\n${row.answer}`.trim()
}

async function embedTextGemini(apiKey: string, text: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS)
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}${errorText ? ` ${errorText}` : ''}`)
    }

    const payload = await response.json()
    const values = payload?.embedding?.values
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('Invalid embedding response')
    }
    return values as number[]
  } finally {
    clearTimeout(timeout)
  }
}

async function writeFaqIndex(rows: SourceFaq[], sourceUrl: string, sourceHash: string) {
  console.log('[reindex] GEMINI_API_KEY present:', Boolean(String(process.env.GEMINI_API_KEY || '').trim()))
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for smartchat reindex embeddings')
  }

  const now = new Date().toISOString()
  const items = rows.map((row, index) => ({
    id: row.id || String(index + 1),
    question: row.question,
    answer: row.answer,
    embedding: [],
    metadata: {
      sourceType: 'faq',
      sourceName: 'FAQ API',
      sourceUrl,
      category: row.category,
      tags: row.category ? [row.category] : [],
      excerpt: row.answer.length > 180 ? `${row.answer.slice(0, 180)}...` : row.answer,
      importedAt: now,
      updatedAt: row.updatedAt || now,
    },
  }))
  console.log('[reindex] items prepared:', items.length)

  console.log(`[reindex] generating embeddings for ${items.length} items...`)
  let successCount = 0
  for (let offset = 0; offset < items.length; offset += EMBEDDING_BATCH_SIZE) {
    const batchEnd = Math.min(offset + EMBEDDING_BATCH_SIZE, items.length)
    const batchTasks = items.slice(offset, batchEnd).map(async (item) => {
      try {
        const embedding = await embedTextGemini(apiKey, buildEmbeddingText(item))
        item.embedding = embedding
        successCount += 1
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown embedding error'
        console.warn(`[reindex] embedding failed for item ${item.id}: ${message}`)
      }
    })
    await Promise.all(batchTasks)
    if (batchEnd < items.length && EMBEDDING_BATCH_DELAY_MS > 0) {
      await sleep(EMBEDDING_BATCH_DELAY_MS)
    }
  }
  console.log(`[reindex] embeddings generated: ${successCount}/${items.length} succeeded`)

  const payload = {
    createdAt: now,
    count: items.length,
    model: EMBEDDING_MODEL,
    items,
  }

  console.log('[reindex] saving KB payload...', { model: EMBEDDING_MODEL, count: items.length })
  return saveKbIndex(payload, { sourceHash, sourceUrl })
}

async function executeReindex(force = false, reason = 'manual'): Promise<SmartchatReindexResult> {
  const startedAt = Date.now()
  const sourceUrl = buildSourceUrl(DEFAULT_BASE_URL)
  console.log('[reindex] started', { force, reason, sourceUrl })
  const previousState = readState()
  const nextState: SmartchatReindexState = {
    ...previousState,
    lastRunAt: new Date().toISOString(),
    sourceUrl,
    lastReason: reason,
  }

  try {
    const rows = await fetchFaqRows(sourceUrl)
    console.log('[reindex] faq rows loaded:', rows.length)
    const hash = buildHash(rows)
    console.log('[reindex] source hash:', hash)
    const durationMs = Date.now() - startedAt

    if (!force && previousState.lastHash && previousState.lastHash === hash) {
      console.log('[reindex] skipped: no changes detected')
      nextState.lastDurationMs = durationMs
      nextState.lastCount = rows.length
      nextState.lastError = undefined
      writeState(nextState)
      return {
        ok: true,
        updated: false,
        reason: 'no_changes',
        count: rows.length,
        hash,
        durationMs,
        sourceUrl,
        state: nextState,
      }
    }

    console.log('[reindex] writing faq index...')
    const persisted = await writeFaqIndex(rows, sourceUrl, hash)
    console.log('[reindex] save complete:', persisted)
    nextState.lastSuccessAt = new Date().toISOString()
    nextState.lastDurationMs = durationMs
    nextState.lastCount = rows.length
    nextState.lastHash = hash
    nextState.lastError = undefined
    writeState(nextState)

    return {
      ok: true,
      updated: true,
      reason: force ? 'force_rebuild' : 'content_changed',
      count: rows.length,
      storage: persisted.storage,
      hash,
      durationMs,
      sourceUrl,
      state: nextState,
    }
  } catch (error: unknown) {
    const durationMs = Date.now() - startedAt
    const errorMessage = error instanceof Error ? error.message : 'Unknown reindex error'
    console.error('[reindex] failed:', errorMessage)
    nextState.lastDurationMs = durationMs
    nextState.lastError = errorMessage
    writeState(nextState)
    return {
      ok: false,
      updated: false,
      reason: 'failed',
      count: Number(nextState.lastCount || 0),
      durationMs,
      sourceUrl,
      state: nextState,
      error: errorMessage,
    }
  }
}

export function getSmartchatReindexState() {
  return {
    running: Boolean(runningPromise),
    state: readState(),
    sourceUrl: buildSourceUrl(DEFAULT_BASE_URL),
  }
}

export async function runSmartchatReindex(
  options?: { force?: boolean; reason?: string }
): Promise<SmartchatReindexResult> {
  if (runningPromise) return runningPromise
  runningPromise = executeReindex(Boolean(options?.force), options?.reason || 'manual')
  try {
    return await runningPromise
  } finally {
    runningPromise = null
  }
}
