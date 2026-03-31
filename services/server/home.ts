import { getOffersList } from '@/services/server/offers'
import { getCampusLifeList } from '@/services/server/campus-life'
import { resolveMediaUrl } from '@/services/shared/media-url'

export interface HomeSectionText {
    titleAr?: string
    titleEn?: string
    descriptionAr?: string
    descriptionEn?: string
}

export interface HomeVideoSectionText extends HomeSectionText {
    overlayTitleAr?: string
    overlayTitleEn?: string
    overlayDescriptionAr?: string
    overlayDescriptionEn?: string
    videoUrl?: string
    videoFile?: string
}

export interface HomeSiteProfile {
    siteName?: string
    siteNameAr?: string
    siteDescriptionAr?: string
    siteDescriptionEn?: string
    contactPhone?: string
    contactEmail?: string
    addressAr?: string
    addressEn?: string
    mapLocation?: string
    socialLinks?: Array<{
        labelAr?: string
        labelEn?: string
        url?: string
        openInNewTab?: boolean
    }>
}

export interface HomeCmsData {
    hero: Record<string, any>
    stats: Array<Record<string, any>>
    about: Record<string, any>
    sections: {
        campusLife?: HomeSectionText
        projects?: HomeSectionText
        colleges?: HomeSectionText
        news?: HomeSectionText
        events?: HomeSectionText
        faq?: HomeSectionText
        video?: HomeVideoSectionText
        contact?: HomeSectionText
    }
    siteProfile: HomeSiteProfile
    news: any[]
    events: any[]
    colleges: any[]
    faqs: any[]
    campusLife: any[]
    projects: any[]
}

export interface HomeData {
    home: HomeCmsData
    events: any[]
    news: any[]
    colleges: any[]
    campusLife: any[]
    projects: any[]
    faqs: any[]
    offers: any[]
}

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const HOME_ENDPOINT = '/api/method/aau_university.api.v1.public.get_home'

const defaultHome: HomeCmsData = {
    hero: {},
    stats: [],
    about: {},
    sections: {},
    siteProfile: {},
    news: [],
    events: [],
    colleges: [],
    faqs: [],
    campusLife: [],
    projects: [],
}

const MEDIA_KEY_PATTERN = /(image|icon|logo|photo|file|fileurl)$/i

function normalizeMediaDeep(value: any, keyHint = ''): any {
    if (Array.isArray(value)) {
        return value.map((entry) => normalizeMediaDeep(entry))
    }

    if (value && typeof value === 'object') {
        const next: Record<string, any> = {}
        for (const [key, entry] of Object.entries(value)) {
            next[key] = normalizeMediaDeep(entry, key)
        }
        return next
    }

    if (typeof value === 'string' && MEDIA_KEY_PATTERN.test(keyHint)) {
        return resolveMediaUrl(value)
    }

    return value
}

async function fetchHomeCms(): Promise<HomeCmsData> {
    try {
        const response = await fetch(`${API_BASE}${HOME_ENDPOINT}`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        })

        if (!response.ok) {
            return defaultHome
        }

        const payload = await response.json()
        const message = payload?.message ?? payload
        const data = message?.data ?? message

        return {
            hero: data?.hero || {},
            stats: Array.isArray(data?.stats) ? data.stats : [],
            about: data?.about || {},
            sections: data?.sections || {},
            siteProfile: data?.siteProfile || {},
            news: normalizeMediaDeep(Array.isArray(data?.news) ? data.news : []),
            events: normalizeMediaDeep(Array.isArray(data?.events) ? data.events : []),
            colleges: normalizeMediaDeep(Array.isArray(data?.colleges) ? data.colleges : []),
            faqs: Array.isArray(data?.faqs) ? data.faqs : [],
            campusLife: normalizeMediaDeep(Array.isArray(data?.campusLife) ? data.campusLife : []),
            projects: normalizeMediaDeep(Array.isArray(data?.projects) ? data.projects : []),
        }
    } catch {
        return defaultHome
    }
}

export async function getHomeData(): Promise<HomeData> {
    const [homeCms, offersData, campusLifeData] = await Promise.all([
        fetchHomeCms(),
        getOffersList(),
        getCampusLifeList(),
    ])

    const campusLife = Array.isArray(campusLifeData) && campusLifeData.length
        ? campusLifeData
        : homeCms.campusLife

    return {
        home: homeCms,
        events: homeCms.events,
        news: homeCms.news,
        colleges: homeCms.colleges,
        campusLife,
        projects: homeCms.projects,
        faqs: homeCms.faqs,
        offers: offersData,
    }
}
