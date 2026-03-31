import { resolveMediaUrl } from '@/services/shared/media-url'

export interface AboutPageHeader {
    badgeAr?: string
    badgeEn?: string
    titleAr?: string
    titleEn?: string
    descriptionAr?: string
    descriptionEn?: string
}

export interface AboutIntro {
    bodyAr?: string
    bodyEn?: string
    image?: string
}

export interface AboutIdentityItem {
    key?: string
    titleAr?: string
    titleEn?: string
    descriptionAr?: string
    descriptionEn?: string
}

export interface AboutPresidentMessage {
    sectionTitleAr?: string
    sectionTitleEn?: string
    introAr?: string
    introEn?: string
    bodyAr?: string
    bodyEn?: string
    closingAr?: string
    closingEn?: string
    nameAr?: string
    nameEn?: string
    roleAr?: string
    roleEn?: string
    image?: string
}

export interface AboutTeamMember {
    nameAr?: string
    nameEn?: string
    roleAr?: string
    roleEn?: string
    image?: string
    displayOrder?: number
}

export interface AboutTeamGroup {
    titleAr?: string
    titleEn?: string
    members?: AboutTeamMember[]
}

export interface AboutTeamSection {
    titleAr?: string
    titleEn?: string
    descriptionAr?: string
    descriptionEn?: string
    groups?: AboutTeamGroup[]
}

export interface AboutPageData {
    pageHeader: AboutPageHeader
    intro: AboutIntro
    identity: AboutIdentityItem[]
    presidentMessage: AboutPresidentMessage
    team: AboutTeamSection
}

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const ABOUT_ENDPOINT = '/api/method/aau_university.api.v1.public.get_about_page'

const defaultAbout: AboutPageData = {
    pageHeader: {},
    intro: {},
    identity: [],
    presidentMessage: {},
    team: { groups: [] },
}

export async function getAboutPageData(): Promise<AboutPageData> {
    try {
        const response = await fetch(`${API_BASE}${ABOUT_ENDPOINT}`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        })

        if (!response.ok) {
            return defaultAbout
        }

        const payload = await response.json()
        const message = payload?.message ?? payload
        const data = message?.data ?? message

        return {
            pageHeader: data?.pageHeader || {},
            intro: {
                ...(data?.intro || {}),
                image: resolveMediaUrl(data?.intro?.image),
            },
            identity: Array.isArray(data?.identity) ? data.identity : [],
            presidentMessage: {
                ...(data?.presidentMessage || {}),
                image: resolveMediaUrl(data?.presidentMessage?.image),
            },
            team: {
                ...(data?.team || { groups: [] }),
                groups: Array.isArray(data?.team?.groups)
                    ? data.team.groups.map((group: any) => ({
                          ...group,
                          members: Array.isArray(group?.members)
                              ? group.members.map((member: any) => ({
                                    ...member,
                                    image: resolveMediaUrl(member?.image),
                                }))
                              : [],
                      }))
                    : [],
            },
        }
    } catch {
        return defaultAbout
    }
}
