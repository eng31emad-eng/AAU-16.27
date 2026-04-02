import { NextResponse } from 'next/server'
import { getSmartchatReindexState, runSmartchatReindex } from '@/services/server/smartchat-reindex'

export const runtime = 'nodejs'

function readTokenFromRequest(req: Request) {
  const headerToken = req.headers.get('x-smartchat-reindex-token') || ''
  if (headerToken.trim()) return headerToken.trim()
  const auth = req.headers.get('authorization') || ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  return ''
}

function isAuthorized(req: Request) {
  const requiredToken = String(process.env.SMARTCHAT_REINDEX_TOKEN || '').trim()
  if (!requiredToken) return true
  return readTokenFromRequest(req) === requiredToken
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ ok: true, ...getSmartchatReindexState() })
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({} as any))
    const force = Boolean(body?.force)
    const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'manual_api'
    console.log('[reindex-route] POST called', { force, reason })
    const result = await runSmartchatReindex({ force, reason })
    console.log('[reindex-route] result', result)

    if (!result.ok) {
      return NextResponse.json(result, { status: 500 })
    }
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('[reindex-route] unexpected error', error)
    return NextResponse.json(
      { ok: false, error: 'Unexpected reindex route error' },
      { status: 500 }
    )
  }
}
