export const API_BASE = (
  process.env.NEXT_PUBLIC_AAU_API_BASE_URL ||
  process.env.AAU_API_BASE_URL ||
  'https://edu.yemenfrappe.com'
).replace(/\/$/, '')
const FALLBACK_API_BASE = 'https://edu.yemenfrappe.com'

type JsonLike = Record<string, any> | any[] | null

function isFormDataBody(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function unwrapPayload(payload: any) {
  if (payload?.ok === true) {
    return payload.data
  }
  if (payload?.message?.ok === true) {
    return payload.message.data
  }
  if (payload?.data?.ok === true) {
    return payload.data.data
  }
  if (payload?.message?.data?.ok === true) {
    return payload.message.data.data
  }
  if (payload?.data !== undefined) {
    return payload.data
  }
  if (payload?.message?.data !== undefined) {
    return payload.message.data
  }
  if (payload?.message !== undefined) {
    return payload.message
  }
  return payload
}

function extractError(payload: any, response: Response) {
  const message =
    payload?.error?.message ||
    payload?.data?.error?.message ||
    payload?.data?.message?.error?.message ||
    payload?.message?.error?.message ||
    payload?.data?.message ||
    payload?.message ||
    response.statusText ||
    'Portal request failed'

  const code =
    payload?.error?.code ||
    payload?.data?.error?.code ||
    payload?.data?.message?.error?.code ||
    payload?.message?.error?.code ||
    `HTTP_${response.status}`

  return { code, message }
}

function shouldRetryWithFallback(response: Response, payload: any, requestUrl: string) {
  if (response.status !== 404) return false
  if (requestUrl.startsWith(FALLBACK_API_BASE)) return false
  const contentType = String(response.headers.get('content-type') || '').toLowerCase()
  const message = String(payload?.message || '')
  return contentType.includes('text/html') || message.includes('<!DOCTYPE html')
}

export class PortalApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'PortalApiError'
    this.code = code
    this.status = status
  }
}

export async function portalRequest<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers || {})
  headers.set('Accept', 'application/json')

  if (init.body && !isFormDataBody(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  async function execute(url: string) {
    return fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
      credentials: 'include',
      mode: 'cors',
    })
  }

  let requestUrl = `${API_BASE}${path}`
  let response = await execute(requestUrl)
  let text = await response.text()
  let payload: JsonLike = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }

  if (shouldRetryWithFallback(response, payload, requestUrl)) {
    requestUrl = `${FALLBACK_API_BASE}${path}`
    response = await execute(requestUrl)
    text = await response.text()
    payload = null
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { message: text }
      }
    }
  }

  if (
    !response.ok ||
    payload?.ok === false ||
    payload?.message?.ok === false ||
    payload?.data?.ok === false ||
    payload?.data?.message?.ok === false
  ) {
    const error = extractError(payload, response)
    throw new PortalApiError(error.message, error.code, response.status)
  }

  return unwrapPayload(payload) as T
}

export function normalizeString(value: any) {
  return String(value || '').trim()
}

export function normalizeNumber(value: any) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export function normalizeArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : []
}

export function normalizeIsoDate(value: any) {
  return normalizeString(value)
}
