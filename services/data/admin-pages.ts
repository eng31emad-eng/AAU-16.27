'use client'

import { portalRequest } from './portal-api'

export type ManagedPage = {
  id: string
  docname: string
  slug: string
  titleAr: string
  contentAr: string
  heroImage: string
  published: boolean
}

function normalizeString(value: any) {
  return String(value || '').trim()
}

function normalizePage(item: any): ManagedPage {
  return {
    id: normalizeString(item?.id || item?.docname || item?.slug),
    docname: normalizeString(item?.docname || item?.id || item?.slug),
    slug: normalizeString(item?.slug || item?.id || item?.docname),
    titleAr: normalizeString(item?.titleAr || item?.pageTitle),
    contentAr: normalizeString(item?.contentAr),
    heroImage: normalizeString(item?.heroImage),
    published: Boolean(item?.published),
  }
}

export async function getManagedPages() {
  const payload = await portalRequest<any[]>('/api/pages')
  return payload.map(normalizePage)
}

export async function saveManagedPage(slug: string, data: Partial<ManagedPage>) {
  const payload = await portalRequest<any>(`/api/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return normalizePage(payload)
}
