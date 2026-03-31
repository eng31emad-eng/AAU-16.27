import fs from 'fs'
import path from 'path'
import type { KbIndex } from '@/types/kb'

const FILE_INDEX_PATH = path.join(process.cwd(), 'data', 'faq_index.json')
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
const SUPABASE_KB_TABLE = String(process.env.SMARTCHAT_SUPABASE_KB_TABLE || 'smartchat_kb_index')
const DEFAULT_ROW_ID = String(process.env.SMARTCHAT_SUPABASE_KB_ROW_ID || 'default')

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
}

function isValidKbIndex(parsed: any): parsed is KbIndex {
  return Boolean(parsed && Array.isArray(parsed.items) && parsed.items.length > 0)
}

function readKbIndexFromFile(): KbIndex {
  if (!fs.existsSync(FILE_INDEX_PATH)) {
    throw new Error('data/faq_index.json not found.')
  }
  const parsed = JSON.parse(fs.readFileSync(FILE_INDEX_PATH, 'utf8')) as KbIndex
  if (!isValidKbIndex(parsed)) {
    throw new Error('data/faq_index.json is empty or invalid.')
  }
  return parsed
}

async function readKbIndexFromSupabase(): Promise<KbIndex | null> {
  if (!hasSupabaseConfig()) return null

  const url =
    `${SUPABASE_URL}/rest/v1/${encodeURIComponent(SUPABASE_KB_TABLE)}` +
    `?id=eq.${encodeURIComponent(DEFAULT_ROW_ID)}&select=index_payload&limit=1`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Supabase KB read failed: ${response.status} ${errorText}`)
  }

  const rows = (await response.json().catch(() => [])) as Array<{ index_payload?: KbIndex }>
  const payload = rows?.[0]?.index_payload
  if (!payload || !isValidKbIndex(payload)) return null
  return payload
}

export async function loadKbIndex(): Promise<KbIndex> {
  if (hasSupabaseConfig()) {
    try {
      const supabaseIndex = await readKbIndexFromSupabase()
      if (supabaseIndex) return supabaseIndex
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[kb-store] Supabase read failed, fallback to file:', message)
    }
  }
  return readKbIndexFromFile()
}

export async function saveKbIndex(
  index: KbIndex,
  options?: { sourceHash?: string; sourceUrl?: string }
): Promise<{ storage: 'supabase' | 'file' }> {
  if (hasSupabaseConfig()) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${encodeURIComponent(SUPABASE_KB_TABLE)}`
      const payload = [
        {
          id: DEFAULT_ROW_ID,
          index_payload: index,
          count: Number(index.count || 0),
          source_hash: options?.sourceHash || null,
          source_url: options?.sourceUrl || null,
          updated_at: new Date().toISOString(),
        },
      ]

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`Supabase KB write failed: ${response.status} ${errorText}`)
      }

      return { storage: 'supabase' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[kb-store] Supabase write failed, fallback to file:', message)
    }
  }

  fs.mkdirSync(path.dirname(FILE_INDEX_PATH), { recursive: true })
  fs.writeFileSync(FILE_INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, 'utf8')
  return { storage: 'file' }
}

