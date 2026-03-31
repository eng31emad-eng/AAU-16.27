'use client'

import { portalRequest } from './portal-api'

export type AdminSettings = {
  siteName: string
  siteNameAr: string
  siteDescriptionAr: string
  contactPhone: string
  contactEmail: string
  addressAr: string
  mapLocation: string
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
}

function normalizeString(value: any) {
  return String(value || '').trim()
}

function normalizeSettings(payload: any): AdminSettings {
  const socialLinks = payload?.socialLinks || {}
  return {
    siteName: normalizeString(payload?.siteName),
    siteNameAr: normalizeString(payload?.siteNameAr || payload?.siteName),
    siteDescriptionAr: normalizeString(payload?.siteDescriptionAr),
    contactPhone: normalizeString(payload?.contactPhone),
    contactEmail: normalizeString(payload?.contactEmail),
    addressAr: normalizeString(payload?.addressAr),
    mapLocation: normalizeString(payload?.mapLocation),
    facebook: normalizeString(socialLinks?.facebook || payload?.facebook),
    twitter: normalizeString(socialLinks?.twitter || payload?.twitter),
    instagram: normalizeString(socialLinks?.instagram || payload?.instagram),
    linkedin: normalizeString(socialLinks?.linkedin || payload?.linkedin),
    youtube: normalizeString(socialLinks?.youtube || payload?.youtube),
  }
}

export async function getAdminSettings() {
  const payload = await portalRequest<any>('/api/aau/profile')
  return normalizeSettings(payload)
}

export async function updateAdminSettings(data: Partial<AdminSettings>) {
  const payload = await portalRequest<any>('/api/aau/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return normalizeSettings(payload)
}
