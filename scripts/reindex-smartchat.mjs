#!/usr/bin/env node
import process from 'process'

const endpoint = process.env.SMARTCHAT_REINDEX_ENDPOINT || 'http://127.0.0.1:3000/api/smartchat/reindex'
const token = String(process.env.SMARTCHAT_REINDEX_TOKEN || '').trim()
const force = String(process.env.SMARTCHAT_REINDEX_FORCE || '').trim() === '1'
const reason = process.env.SMARTCHAT_REINDEX_REASON || 'scheduled_sync'
const timeoutMs = Math.max(Number(process.env.SMARTCHAT_REINDEX_TIMEOUT_MS || 45000), 5000)

async function postWithTimeout(url, body, ms) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-smartchat-reindex-token': token } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  console.log(`[smartchat-reindex] endpoint=${endpoint}`)
  const response = await postWithTimeout(
    endpoint,
    { force, reason },
    timeoutMs,
  )
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload?.ok === false) {
    console.error('[smartchat-reindex] failed', JSON.stringify(payload))
    process.exit(1)
  }
  console.log('[smartchat-reindex] success', JSON.stringify(payload))
}

main().catch((error) => {
  console.error('[smartchat-reindex] error', error instanceof Error ? error.message : error)
  process.exit(1)
})

