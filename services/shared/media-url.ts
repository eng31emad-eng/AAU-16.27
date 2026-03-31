const API_BASE = (
  process.env.NEXT_PUBLIC_AAU_API_BASE_URL ||
  process.env.AAU_API_BASE_URL ||
  'https://edu.yemenfrappe.com'
).replace(/\/$/, '')

export function resolveMediaUrl(value: any): string {
  let raw = String(value || '').trim()
  if (!raw) return ''

  // Fix malformed values like //assets/... or https://assets/...
  if (/^https?:\/\/assets\//i.test(raw)) {
    raw = raw.replace(/^https?:\/\/assets\//i, '/assets/')
  }
  if (/^\/\/assets\//i.test(raw)) {
    raw = raw.replace(/^\/\/assets\//i, '/assets/')
  }

  if (/^(https?:)?\/\//i.test(raw)) {
    return raw.startsWith('//') ? `https:${raw}` : raw
  }
  if (/^(data|blob):/i.test(raw)) {
    return raw
  }

  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`
  if (
    normalizedPath.startsWith('/assets/') ||
    normalizedPath.startsWith('/files/') ||
    normalizedPath.startsWith('/private/files/')
  ) {
    return `${API_BASE}${normalizedPath}`
  }

  return normalizedPath
}
