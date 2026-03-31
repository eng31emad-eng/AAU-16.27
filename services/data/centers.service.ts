import { CenterItem } from '@/types'

const API_BASE = (
  process.env.NEXT_PUBLIC_AAU_API_BASE_URL ||
  process.env.AAU_API_BASE_URL ||
  'https://edu.yemenfrappe.com'
).replace(/\/$/, '')

function unwrapEntityPayload(payload: any) {
  if (payload?.ok && payload?.data !== undefined) {
    return payload.data
  }
  if (payload?.data?.ok && payload?.data?.data !== undefined) {
    return payload.data.data
  }
  return payload?.data ?? payload
}

function normalizeLocalizedList(value: any) {
  if (Array.isArray(value)) {
    return value.map((entry: any) => ({
      ar: String(entry?.ar || entry?.value || ''),
      en: String(entry?.en || entry?.ar || entry?.value || ''),
    }))
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => ({ ar: entry, en: entry }))
  }

  return []
}

function mapCenter(item: any): CenterItem {
  return {
    id: String(item?.id || ''),
    titleAr: String(item?.titleAr || ''),
    titleEn: String(item?.titleEn || item?.titleAr || ''),
    descAr: String(item?.descAr || ''),
    descEn: String(item?.descEn || item?.descAr || ''),
    services: normalizeLocalizedList(item?.services),
    programs: normalizeLocalizedList(item?.programs),
    image: item?.image || '',
    location: item?.location || '',
    phone: item?.phone || '',
    email: item?.email || '',
  }
}

async function fetchCenters(): Promise<CenterItem[]> {
  try {
    const response = await fetch(`${API_BASE}/api/centers`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const payload = await response.json()
    const data = unwrapEntityPayload(payload)
    const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
    return items.map(mapCenter)
  } catch {
    return []
  }
}

export const centersService = {
  getAll: fetchCenters,

  getById: async (id: string): Promise<CenterItem | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/centers/${encodeURIComponent(id)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })

      if (!response.ok) {
        return null
      }

      const payload = await response.json()
      return mapCenter(unwrapEntityPayload(payload))
    } catch {
      return null
    }
  },
}
