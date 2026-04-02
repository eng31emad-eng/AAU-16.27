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

// ─── FIX #2: استخدم /tmp على Vercel بدل /data ────────────────────────────────
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.VERCEL_ENV)
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data')
const STATE_PATH = path.join(DATA_DIR, 'kb_sync_state.json')

const DEFAULT_BASE_URL = (
  process.env.AAU_API_BASE_URL ||
  process.env.NEXT_PUBLIC_AAU_API_BASE_URL ||
  'https://edu.yemenfrappe.com'
).replace(/\/$/, '')
const FAQ_SOURCE_PATH = process.env.SMARTCHAT_FAQ_SOURCE_PATH || '/api/faqs'
const INCLUDE_UNPUBLISHED = String(process.env.SMARTCHAT_REINDEX_INCLUDE_UNPUBLISHED || '').trim() === '1'
const SOURCE_TIMEOUT_MS = Math.max(Number(process.env.SMARTCHAT_REINDEX_TIMEOUT_MS || 25000), 5000)
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001'
const EMBEDDING_BATCH_SIZE = 5
const EMBEDDING_DELAY_MS = 300

let runningPromise: Promise<SmartchatReindexResult> | null = null

function normalizeString(value: unknown) { return String(value || '').trim() }
function normalizeNumber(value: unknown) { const n = Number(value); return Number.isFinite(n) ? n : 0 }
function normalizeBoolean(value: unknown) { return value === true || value === 1 || value === '1' }

// ─── FIX #1: unwrapPayload محسّن يغطي جميع الحالات ──────────────────────────
function unwrapPayload(payload: any): any[] | null {
  // مباشر: مصفوفة
  if (Array.isArray(payload)) {
    console.log('[reindex] payload is direct array, length:', payload.length)
    return payload
  }

  // { headers:{}, data: { ok:true, data:[...] } }  ← الشكل الفعلي للـ API
  if (Array.isArray(payload?.data?.data)) {
    console.log('[reindex] payload.data.data is array, length:', payload.data.data.length)
    return payload.data.data
  }

  // { ok: true, data: [...] }  أو  { data: [...] }
  if (Array.isArray(payload?.data)) {
    console.log('[reindex] payload.data is array, length:', payload.data.length)
    return payload.data
  }

  // { message: { data: [...] } }
  if (Array.isArray(payload?.message?.data)) {
    console.log('[reindex] payload.message.data is array, length:', payload.message.data.length)
    return payload.message.data
  }

  // { message: [...] }
  if (Array.isArray(payload?.message)) {
    console.log('[reindex] payload.message is array, length:', payload.message.length)
    return payload.message
  }

  // مفاتيح شائعة أخرى
  for (const key of ['result', 'items', 'faqs', 'records', 'list', 'rows']) {
    if (Array.isArray(payload?.[key])) {
      console.log(`[reindex] payload.${key} is array, length:`, payload[key].length)
      return payload[key]
    }
  }

  // آخر محاولة: أول قيمة array غير فارغة في الـ object
  if (payload && typeof payload === 'object') {
    for (const key of Object.keys(payload)) {
      if (Array.isArray(payload[key]) && payload[key].length > 0) {
        console.log(`[reindex] found array in payload.${key}, length:`, payload[key].length)
        return payload[key]
      }
    }
  }

  console.error('[reindex] could not unwrap payload. Keys:', payload ? Object.keys(payload) : 'null')
  console.error('[reindex] payload sample:', JSON.stringify(payload)?.slice(0, 400))
  return null
}

// ─── FIX #2: writeState لا يُوقف البرنامج عند فشل الكتابة ──────────────────
function readState(): SmartchatReindexState {
  try {
    if (!fs.existsSync(STATE_PATH)) return {}
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) as SmartchatReindexState
  } catch { return {} }
}

function writeState(state: SmartchatReindexState) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  } catch (err) {
    // على Vercel الـ filesystem مقفول — نتجاهل ونكمل
    console.warn('[reindex] writeState skipped (read-only fs):', (err as Error)?.message)
  }
}

function buildSourceUrl(baseUrl: string) { return `${baseUrl}${FAQ_SOURCE_PATH}` }

function normalizeFaqRows(rows: any[]): SourceFaq[] {
  return rows
    .map((row, index) => ({
      id: normalizeString(row?.id || row?.docname || row?.name || `faq-${index + 1}`),
      question: normalizeString(row?.questionAr || row?.question || row?.title || row?.questionEn),
      answer: normalizeString(row?.answerAr || row?.answer || row?.content || row?.answerEn),
      category: normalizeString(row?.category),
      isPublished: normalizeBoolean(row?.isPublished ?? row?.published ?? 1),
      displayOrder: normalizeNumber(row?.displayOrder),
      updatedAt: normalizeString(row?.updatedAt || row?.modified || row?.updated_at),
    }))
    .filter((item) => item.question && item.answer && (INCLUDE_UNPUBLISHED || item.isPublished))
    .sort((a, b) => (a.displayOrder - b.displayOrder) || a.id.localeCompare(b.id))
}

function buildHash(rows: SourceFaq[]) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(rows.map((r) => ({ id: r.id, q: r.question, a: r.answer, c: r.category, p: r.isPublished, u: r.updatedAt }))))
    .digest('hex')
}

async function fetchFaqRows(sourceUrl: string): Promise<SourceFaq[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS)
  try {
    console.log('[reindex] fetching FAQ source:', sourceUrl)
    const response = await fetch(sourceUrl, {
      method: 'GET', headers: { Accept: 'application/json' },
      cache: 'no-store', signal: controller.signal,
    })
    console.log('[reindex] FAQ source status:', response.status)
    if (!response.ok) throw new Error(`FAQ source request failed: HTTP ${response.status}`)

    const payload = await response.json()
    const rows = unwrapPayload(payload)
    if (!rows) throw new Error('FAQ source payload could not be unwrapped to an array')

    const normalized = normalizeFaqRows(rows)
    console.log(`[reindex] normalized rows: ${normalized.length} (raw: ${rows.length})`)
    return normalized
  } finally {
    clearTimeout(timeout)
  }
}

async function generateEmbedding(apiKey: string, text: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Embedding API error ${response.status}: ${await response.text()}`)
    const data = await response.json()
    const values = data?.embedding?.values
    if (!Array.isArray(values) || values.length === 0) throw new Error('Invalid embedding response')
    return values as number[]
  } finally {
    clearTimeout(timeout)
  }
}

async function generateEmbeddingsForRows(apiKey: string, rows: SourceFaq[]): Promise<number[][]> {
  const embeddings: number[][] = new Array(rows.length).fill([])
  for (let i = 0; i < rows.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = rows.slice(i, i + EMBEDDING_BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((row) => generateEmbedding(apiKey, `${row.question} ${row.answer}`.slice(0, 2000)))
    )
    results.forEach((result, bi) => {
      if (result.status === 'fulfilled') {
        embeddings[i + bi] = result.value
      } else {
        console.warn(`[reindex] embedding failed for item ${i + bi}:`, result.reason?.message)
        embeddings[i + bi] = []
      }
    })
    if (i + EMBEDDING_BATCH_SIZE < rows.length) {
      await new Promise((r) => setTimeout(r, EMBEDDING_DELAY_MS))
    }
  }
  return embeddings
}

// ─── FIX #3: writeFaqIndex يكتب لـ Supabase كما يقرأ الشات ─────────────────
async function writeFaqIndex(rows: SourceFaq[], sourceUrl: string, sourceHash: string) {
  const now = new Date().toISOString()
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim()
  let embeddings: number[][] = rows.map(() => [])
  let usedModel = 'keyword-only'

  if (apiKey) {
    console.log(`[reindex] generating embeddings for ${rows.length} items...`)
    try {
      embeddings = await generateEmbeddingsForRows(apiKey, rows)
      const ok = embeddings.filter((e) => e.length > 0).length
      console.log(`[reindex] embeddings: ${ok}/${rows.length} succeeded`)
      if (ok > rows.length * 0.5) usedModel = EMBEDDING_MODEL
    } catch (err) {
      console.error('[reindex] embedding failed, fallback keyword-only:', err)
    }
  } else {
    console.warn('[reindex] no GEMINI_API_KEY, keyword-only mode')
  }

  const payload = {
    createdAt: now,
    count: rows.length,
    model: usedModel,
    items: rows.map((row, i) => ({
      id: row.id || String(i + 1),
      question: row.question,
      answer: row.answer,
      embedding: embeddings[i] ?? [],
      metadata: {
        sourceType: 'faq', sourceName: 'FAQ API', sourceUrl,
        category: row.category, tags: row.category ? [row.category] : [],
        excerpt: row.answer.length > 180 ? `${row.answer.slice(0, 180)}...` : row.answer,
        importedAt: now, updatedAt: row.updatedAt || now,
      },
    })),
  }

  console.log(`[reindex] saving index: model=${usedModel}, count=${rows.length}`)
  const persisted = await saveKbIndex(payload, { sourceHash, sourceUrl, preferSupabase: true })
  console.log(`[reindex] index saved to: ${persisted.storage}`)
  return persisted
}

async function executeReindex(force = false, reason = 'manual'): Promise<SmartchatReindexResult> {
  const startedAt = Date.now()
  const sourceUrl = buildSourceUrl(DEFAULT_BASE_URL)
  const previousState = readState()
  const nextState: SmartchatReindexState = {
    ...previousState, lastRunAt: new Date().toISOString(), sourceUrl, lastReason: reason,
  }
  console.log('[reindex] started', { force, reason, sourceUrl })

  try {
    const rows = await fetchFaqRows(sourceUrl)
    const hash = buildHash(rows)

    if (!force && previousState.lastHash === hash) {
      const durationMs = Date.now() - startedAt
      nextState.lastDurationMs = durationMs
      nextState.lastCount = rows.length
      nextState.lastError = undefined
      writeState(nextState)
      console.log('[reindex] no changes, skipping')
      return { ok: true, updated: false, reason: 'no_changes', count: rows.length, hash, durationMs, sourceUrl, state: nextState }
    }

    const persisted = await writeFaqIndex(rows, sourceUrl, hash)
    const durationMs = Date.now() - startedAt
    nextState.lastSuccessAt = new Date().toISOString()
    nextState.lastDurationMs = durationMs
    nextState.lastCount = rows.length
    nextState.lastHash = hash
    nextState.lastError = undefined
    writeState(nextState)
    console.log(`[reindex] done in ${durationMs}ms`)
    return {
      ok: true, updated: true, reason: force ? 'force_rebuild' : 'content_changed',
      count: rows.length, storage: persisted.storage, hash, durationMs, sourceUrl, state: nextState,
    }
  } catch (error: unknown) {
    const durationMs = Date.now() - startedAt
    const errorMessage = error instanceof Error ? error.message : 'Unknown reindex error'
    console.error('[reindex] failed:', errorMessage)
    nextState.lastDurationMs = durationMs
    nextState.lastError = errorMessage
    writeState(nextState)
    return { ok: false, updated: false, reason: 'failed', count: Number(nextState.lastCount || 0), durationMs, sourceUrl, state: nextState, error: errorMessage }
  }
}

export function getSmartchatReindexState() {
  return { running: Boolean(runningPromise), state: readState(), sourceUrl: buildSourceUrl(DEFAULT_BASE_URL) }
}

export async function runSmartchatReindex(options?: { force?: boolean; reason?: string }): Promise<SmartchatReindexResult> {
  if (runningPromise) return runningPromise
  runningPromise = executeReindex(Boolean(options?.force), options?.reason || 'manual')
  try { return await runningPromise } finally { runningPromise = null }
}
