export interface ContactPageHeaderData {
  badgeAr?: string
  badgeEn?: string
  titleAr?: string
  titleEn?: string
  descriptionAr?: string
  descriptionEn?: string
}

export interface ContactPageFormData {
  titleAr?: string
  titleEn?: string
}

export interface ContactPageSocialData {
  titleAr?: string
  titleEn?: string
}

export interface ContactPageSiteProfile {
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

export interface ContactPageData {
  pageHeader: ContactPageHeaderData
  form: ContactPageFormData
  social: ContactPageSocialData
  siteProfile: ContactPageSiteProfile
}

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const CONTACT_ENDPOINT = '/api/method/aau_university.api.v1.public.get_contact_page'

const defaultContact: ContactPageData = {
  pageHeader: {},
  form: {},
  social: {},
  siteProfile: {},
}

export async function getContactPageData(): Promise<ContactPageData> {
  try {
    const response = await fetch(`${API_BASE}${CONTACT_ENDPOINT}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      return defaultContact
    }

    const payload = await response.json()
    const message = payload?.message ?? payload
    const data = message?.data ?? message

    return {
      pageHeader: data?.pageHeader || {},
      form: data?.form || {},
      social: data?.social || {},
      siteProfile: data?.siteProfile || {},
    }
  } catch {
    return defaultContact
  }
}
