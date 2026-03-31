import { CenterItem } from '@/types'
import { resolveMediaUrl } from '@/services/shared/media-url'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const CENTERS_LIST_ENDPOINT = '/api/centers'
const CENTERS_DETAIL_ENDPOINT = '/api/centers'

async function fetchCentersJson(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Centers API request failed: ${response.status}`)
  }

  return response.json()
}

function unwrapCentersPayload(payload: any) {
  if (payload?.ok === true) {
    return payload.data
  }
  if (payload?.data?.ok === true) {
    return payload.data.data
  }
  if (payload?.data !== undefined) {
    return payload.data
  }
  return payload
}

function mapCenterItem(item: any): CenterItem {
  return {
    id: String(item?.id || ''),
    titleAr: String(item?.titleAr || ''),
    titleEn: String(item?.titleEn || item?.titleAr || ''),
    descAr: String(item?.descAr || ''),
    descEn: String(item?.descEn || item?.descAr || ''),
    services: Array.isArray(item?.services)
      ? item.services.map((entry: any) => ({
          ar: String(entry?.ar || entry?.value || ''),
          en: String(entry?.en || entry?.ar || entry?.value || ''),
        }))
      : [],
    programs: Array.isArray(item?.programs)
      ? item.programs.map((entry: any) => ({
          ar: String(entry?.ar || entry?.value || ''),
          en: String(entry?.en || entry?.ar || entry?.value || ''),
        }))
      : [],
    image: resolveMediaUrl(item?.image),
    location: item?.location || '',
    phone: item?.phone || '',
    email: item?.email || '',
  }
}

export async function getCentersList(): Promise<CenterItem[]> {
  try {
    const payload = await fetchCentersJson(CENTERS_LIST_ENDPOINT)
    const data = unwrapCentersPayload(payload)
    const items = Array.isArray(data) ? data : Array.isArray(payload) ? payload : []
    return items.map(mapCenterItem)
  } catch {
    return []
  }
}

export async function getCenterById(id: string): Promise<CenterItem | null> {
  try {
    const payload = await fetchCentersJson(`${CENTERS_DETAIL_ENDPOINT}/${encodeURIComponent(id)}`)
    const data = unwrapCentersPayload(payload)
    return mapCenterItem(data)
  } catch {
    return null
  }
}
