import { NewsItem } from '@/types'
import { resolveMediaUrl } from '@/services/shared/media-url'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const NEWS_LIST_ENDPOINT = '/api/aau/news?limit=100'
const NEWS_DETAIL_ENDPOINT = '/api/aau/news'
const SAFE_SLUG_RE = /^[a-z0-9-]+$/i
const ENCODED_SLUG_PREFIX = 'n-'

function toPublicNewsSlug(value: string): string {
  const slug = String(value || '').trim()
  if (!slug) return ''
  if (SAFE_SLUG_RE.test(slug)) return slug
  return `${ENCODED_SLUG_PREFIX}${Buffer.from(slug, 'utf8').toString('base64url')}`
}

function toSourceNewsSlug(value: string): string {
  const slug = String(value || '').trim()
  if (!slug.startsWith(ENCODED_SLUG_PREFIX)) return slug
  try {
    return Buffer.from(slug.slice(ENCODED_SLUG_PREFIX.length), 'base64url').toString('utf8')
  } catch {
    return slug
  }
}

async function fetchNewsJson(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`News API request failed: ${response.status}`)
  }

  return response.json()
}

function mapNewsItem(item: any): NewsItem {
  const sourceSlug = String(item?.slug || item?.id || '')
  return {
    id: String(item?.id || ''),
    slug: toPublicNewsSlug(sourceSlug),
    titleAr: String(item?.titleAr || ''),
    titleEn: String(item?.titleEn || item?.titleAr || ''),
    descriptionAr: String(item?.descriptionAr || ''),
    descriptionEn: String(item?.descriptionEn || item?.descriptionAr || ''),
    contentAr: String(item?.contentAr || ''),
    contentEn: String(item?.contentEn || item?.contentAr || ''),
    image: resolveMediaUrl(item?.image),
    date: String(item?.date || ''),
    views: Number(item?.views || 0),
    tags: Array.isArray(item?.tags) ? item.tags : [],
  }
}

function unwrapNewsPayload(payload: any) {
  if (payload?.ok && payload?.data !== undefined) {
    return payload.data
  }
  if (payload?.message?.ok && payload?.message?.data !== undefined) {
    return payload.message.data
  }
  if (payload?.data?.ok && payload?.data?.data !== undefined) {
    return payload.data.data
  }
  if (payload?.data !== undefined) {
    return payload.data
  }
  return payload
}

export async function getNewsList(): Promise<NewsItem[]> {
  try {
    const payload = await fetchNewsJson(NEWS_LIST_ENDPOINT)
    const data = unwrapNewsPayload(payload)
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    return items.map(mapNewsItem)
  } catch {
    return []
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const resolvedSlug = toSourceNewsSlug(slug)
    const payload = await fetchNewsJson(`${NEWS_DETAIL_ENDPOINT}/${encodeURIComponent(resolvedSlug)}`)
    const data = unwrapNewsPayload(payload)
    return mapNewsItem(data)
  } catch {
    return null
  }
}
