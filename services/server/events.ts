import { EventItem } from '@/types'
import { resolveMediaUrl } from '@/services/shared/media-url'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const EVENTS_LIST_ENDPOINT = '/api/aau/events?limit=100'
const EVENTS_DETAIL_ENDPOINT = '/api/aau/events'

async function fetchEventsJson(path: string) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error(`Events API request failed: ${response.status}`)
    }

    return response.json()
}

function parseLocalDate(value?: string | null) {
    if (!value) return null

    const normalized = String(value).trim()
    if (!normalized) return null

    const localDateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (localDateMatch) {
        const [, year, month, day] = localDateMatch
        return new Date(Number(year), Number(month) - 1, Number(day))
    }

    const parsed = new Date(normalized)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
}

function deriveEventStatus(item: any) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const startDate = parseLocalDate(item?.date)
    const endDate = parseLocalDate(item?.endDate) || (startDate ? new Date(startDate) : null)

    if (startDate && !Number.isNaN(startDate.getTime())) {
        startDate.setHours(0, 0, 0, 0)
        if (endDate && !Number.isNaN(endDate.getTime())) {
            endDate.setHours(23, 59, 59, 999)
            if (endDate < now) return 'completed'
            if (startDate <= now && now <= endDate) return 'ongoing'
        }

        if (startDate > now) return 'upcoming'
        return 'ongoing'
    }

    const rawStatus = String(item?.status || '').trim().toLowerCase()
    if (rawStatus === 'ended' || rawStatus === 'past') return 'completed'
    if (rawStatus === 'ongoing' || rawStatus === 'completed' || rawStatus === 'upcoming') return rawStatus
    return 'upcoming'
}

function unwrapEventsPayload(payload: any) {
    if (payload?.ok && payload?.data) {
        return payload.data
    }

    if (payload?.message?.ok && payload?.message?.data) {
        return payload.message.data
    }

    if (payload?.data?.ok && payload?.data?.data) {
        return payload.data.data
    }

    if (payload?.data) {
        return payload.data
    }

    return payload
}

function mapEventItem(item: any): EventItem {
    const derivedStatus = deriveEventStatus(item)
    return {
        id: String(item?.id || ''),
        slug: String(item?.slug || item?.id || ''),
        titleAr: String(item?.titleAr || ''),
        titleEn: String(item?.titleEn || item?.titleAr || ''),
        descriptionAr: String(item?.descriptionAr || ''),
        descriptionEn: String(item?.descriptionEn || item?.descriptionAr || ''),
        contentAr: String(item?.contentAr || item?.descriptionAr || ''),
        contentEn: String(item?.contentEn || item?.descriptionEn || item?.contentAr || item?.descriptionAr || ''),
        date: String(item?.date || ''),
        endDate: item?.endDate ? String(item.endDate) : undefined,
        locationAr: String(item?.locationAr || ''),
        locationEn: String(item?.locationEn || item?.locationAr || ''),
        organizerAr: String(item?.organizerAr || ''),
        organizerEn: String(item?.organizerEn || item?.organizerAr || ''),
        category: item?.category || 'other',
        status: derivedStatus,
        registrationRequired: Boolean(item?.registrationRequired),
        registrationLink: item?.registrationLink || undefined,
        image: resolveMediaUrl(item?.image),
    }
}

export async function getEventsList(): Promise<EventItem[]> {
    try {
        const payload = await fetchEventsJson(EVENTS_LIST_ENDPOINT)
        const data = unwrapEventsPayload(payload)
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(payload?.items) ? payload.items : []
        return items.map(mapEventItem)
    } catch {
        return []
    }
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
    try {
        const payload = await fetchEventsJson(`${EVENTS_DETAIL_ENDPOINT}/${encodeURIComponent(slug)}`)
        const data = unwrapEventsPayload(payload)
        return mapEventItem(data)
    } catch {
        return null
    }
}
