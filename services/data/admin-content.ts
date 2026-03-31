'use client'

import { portalRequest } from './portal-api'

function normalizeString(value: any) {
  return String(value || '').trim()
}

function normalizeNumber(value: any) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeDate(value: any) {
  return normalizeString(value).slice(0, 10)
}

export type AdminNewsItem = {
  id: string
  titleAr: string
  titleEn: string
  slug: string
  descriptionAr: string
  descriptionEn: string
  contentAr: string
  contentEn: string
  image: string
  publishDate: string
  displayOrder: number
  isPublished: boolean
  views: number
}

export type AdminEventItem = {
  id: string
  eventTitle: string
  description: string
  eventDate: string
  location: string
  image: string
  isPublished: boolean
  displayOrder: number
}

export type AdminOfferItem = {
  id: string
  titleAr: string
  titleEn: string
  descAr: string
  descEn: string
  detailsAr: string
  detailsEn: string
  category: string
  image: string
  validUntil: string
  requirementsAr: string
  requirementsEn: string
  applyLink: string
  isActive: boolean
  isPublished: boolean
  displayOrder: number
}

export type AdminPartnerItem = {
  id: string
  title: string
  content: string
  image: string
  isPublished: boolean
  displayOrder: number
}

export type AdminProjectItem = {
  id: string
  slug: string
  titleAr: string
  titleEn: string
  descAr: string
  descEn: string
  detailsAr: string
  detailsEn: string
  startDate: string
  endDate: string
  year: number
  progress: number
  status: string
  isPublished: boolean
  displayOrder: number
}

export type AdminMediaItem = {
  id: string
  title: string
  type: string
  fileUrl: string
  description: string
  isPublished: boolean
}

export type AdminBlogItem = {
  id: string
  slug: string
  titleAr: string
  titleEn: string
  excerptAr: string
  excerptEn: string
  contentAr: string
  contentEn: string
  authorNameAr: string
  authorNameEn: string
  category: string
  categoryAr: string
  categoryEn: string
  image: string
  publishedAt: string
  readTime: number
  views: number
  isPublished: boolean
  displayOrder: number
}

export type AdminFaqItem = {
  id: string
  title: string
  questionAr: string
  questionEn: string
  answerAr: string
  answerEn: string
  category: string
  image: string
  isPublished: boolean
  displayOrder: number
}

export type AdminCenterItem = {
  id: string
  titleAr: string
  titleEn: string
  descAr: string
  descEn: string
  services: string[]
  programs: string[]
  image: string
  location: string
  phone: string
  email: string
  isPublished: boolean
  displayOrder: number
}

export type AdminFacultyItem = {
  id: string
  fullName: string
  academicTitle: string
  linkedCollege: string
  department: string
  biography: string
  photo: string
  email: string
  phone: string
  isActive: boolean
}

export type AdminDepartmentOption = {
  id: string
  nameAr: string
  nameEn: string
  college: string
  collegeLabel: string
}

function normalizeNews(item: any): AdminNewsItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    titleAr: normalizeString(item?.titleAr || item?.title),
    titleEn: normalizeString(item?.titleEn || item?.title),
    slug: normalizeString(item?.slug),
    descriptionAr: normalizeString(item?.descriptionAr || item?.summary),
    descriptionEn: normalizeString(item?.descriptionEn || item?.summary),
    contentAr: normalizeString(item?.contentAr || item?.content),
    contentEn: normalizeString(item?.contentEn || item?.content),
    image: normalizeString(item?.image || item?.featuredImage),
    publishDate: normalizeDate(item?.publishDate || item?.date),
    displayOrder: normalizeNumber(item?.displayOrder),
    isPublished: Boolean(item?.isPublished),
    views: normalizeNumber(item?.views),
  }
}

function normalizeEvent(item: any): AdminEventItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    eventTitle: normalizeString(item?.eventTitle),
    description: normalizeString(item?.description),
    eventDate: normalizeDate(item?.eventDate),
    location: normalizeString(item?.location),
    image: normalizeString(item?.image),
    isPublished: Boolean(item?.isPublished),
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizeOffer(item: any): AdminOfferItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn),
    descAr: normalizeString(item?.descAr),
    descEn: normalizeString(item?.descEn),
    detailsAr: normalizeString(item?.detailsAr),
    detailsEn: normalizeString(item?.detailsEn),
    category: normalizeString(item?.category),
    image: normalizeString(item?.image),
    validUntil: normalizeDate(item?.validUntil),
    requirementsAr: normalizeString(item?.requirementsAr),
    requirementsEn: normalizeString(item?.requirementsEn),
    applyLink: normalizeString(item?.applyLink),
    isActive: Boolean(item?.isActive),
    isPublished: Boolean(item?.isPublished),
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizePartner(item: any): AdminPartnerItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    title: normalizeString(item?.title),
    content: normalizeString(item?.content),
    image: normalizeString(item?.image),
    isPublished: Boolean(item?.isPublished),
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizeProject(item: any): AdminProjectItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    slug: normalizeString(item?.slug),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn),
    descAr: normalizeString(item?.descAr),
    descEn: normalizeString(item?.descEn),
    detailsAr: normalizeString(item?.detailsAr),
    detailsEn: normalizeString(item?.detailsEn),
    startDate: normalizeDate(item?.startDate),
    endDate: normalizeDate(item?.endDate),
    year: normalizeNumber(item?.year),
    progress: normalizeNumber(item?.progress),
    status: normalizeString(item?.status || 'planned'),
    isPublished: Boolean(item?.isPublished),
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizeMedia(item: any): AdminMediaItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    title: normalizeString(item?.mediaTitle || item?.title || item?.fileName),
    type: normalizeString(item?.mediaType || item?.fileType || 'Document'),
    fileUrl: normalizeString(item?.file || item?.filePath),
    description: normalizeString(item?.description),
    isPublished: Boolean(item?.isPublished),
  }
}

function normalizeBlog(item: any): AdminBlogItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    slug: normalizeString(item?.slug),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn),
    excerptAr: normalizeString(item?.excerptAr),
    excerptEn: normalizeString(item?.excerptEn),
    contentAr: normalizeString(item?.contentAr),
    contentEn: normalizeString(item?.contentEn),
    authorNameAr: normalizeString(item?.authorNameAr),
    authorNameEn: normalizeString(item?.authorNameEn),
    category: normalizeString(item?.category),
    categoryAr: normalizeString(item?.categoryAr || item?.category),
    categoryEn: normalizeString(item?.categoryEn || item?.category),
    image: normalizeString(item?.image),
    publishedAt: normalizeDate(item?.publishedAt),
    readTime: normalizeNumber(item?.readTime),
    views: normalizeNumber(item?.views),
    isPublished: Boolean(item?.isPublished),
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizeFaq(item: any): AdminFaqItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    title: normalizeString(item?.title || item?.questionAr || item?.questionEn),
    questionAr: normalizeString(item?.questionAr || item?.title),
    questionEn: normalizeString(item?.questionEn || item?.title),
    answerAr: normalizeString(item?.answerAr || item?.content),
    answerEn: normalizeString(item?.answerEn || item?.content),
    category: normalizeString(item?.category),
    image: normalizeString(item?.image),
    isPublished: Boolean(item?.isPublished),
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizeCenter(item: any): AdminCenterItem {
  return {
    id: normalizeString(item?.id),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn),
    descAr: normalizeString(item?.descAr),
    descEn: normalizeString(item?.descEn),
    services: Array.isArray(item?.services) ? item.services.map((entry: any) => normalizeString(entry?.ar || entry?.value || entry)) : [],
    programs: Array.isArray(item?.programs) ? item.programs.map((entry: any) => normalizeString(entry?.ar || entry?.value || entry)) : [],
    image: normalizeString(item?.image),
    location: normalizeString(item?.location),
    phone: normalizeString(item?.phone),
    email: normalizeString(item?.email),
    isPublished: true,
    displayOrder: normalizeNumber(item?.displayOrder),
  }
}

function normalizeFaculty(item: any): AdminFacultyItem {
  return {
    id: normalizeString(item?.id),
    fullName: normalizeString(item?.nameAr || item?.nameEn),
    academicTitle: normalizeString(item?.degreeAr || item?.degreeEn),
    linkedCollege: normalizeString(item?.linkedCollege),
    department: normalizeString(item?.departmentAr || item?.collegeAr || item?.specializationAr),
    biography: normalizeString(item?.bioAr || item?.bioEn),
    photo: normalizeString(item?.image),
    email: normalizeString(item?.email),
    phone: normalizeString(item?.phone),
    isActive: true,
  }
}

export async function getAdminNews() {
  const payload = await portalRequest<any[]>('/api/news')
  return payload.map(normalizeNews)
}

export async function createAdminNews(data: Partial<AdminNewsItem>) {
  const payload = await portalRequest<any>('/api/news', { method: 'POST', body: JSON.stringify(data) })
  return normalizeNews(payload)
}

export async function updateAdminNews(id: string, data: Partial<AdminNewsItem>) {
  const payload = await portalRequest<any>(`/api/news/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeNews(payload)
}

export async function deleteAdminNews(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/news/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminEvents() {
  const payload = await portalRequest<any[]>('/api/events')
  return payload.map(normalizeEvent)
}

export async function createAdminEvent(data: Partial<AdminEventItem>) {
  const payload = await portalRequest<any>('/api/events', { method: 'POST', body: JSON.stringify(data) })
  return normalizeEvent(payload)
}

export async function updateAdminEvent(id: string, data: Partial<AdminEventItem>) {
  const payload = await portalRequest<any>(`/api/events/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeEvent(payload)
}

export async function deleteAdminEvent(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/events/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminOffers() {
  const payload = await portalRequest<any[]>('/api/offers')
  return payload.map(normalizeOffer)
}

export async function createAdminOffer(data: Partial<AdminOfferItem>) {
  const payload = await portalRequest<any>('/api/offers', { method: 'POST', body: JSON.stringify(data) })
  return normalizeOffer(payload)
}

export async function updateAdminOffer(id: string, data: Partial<AdminOfferItem>) {
  const payload = await portalRequest<any>(`/api/offers/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeOffer(payload)
}

export async function deleteAdminOffer(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/offers/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminPartners() {
  const payload = await portalRequest<any[]>('/api/partners')
  return payload.map(normalizePartner)
}

export async function createAdminPartner(data: Partial<AdminPartnerItem>) {
  const payload = await portalRequest<any>('/api/partners', { method: 'POST', body: JSON.stringify(data) })
  return normalizePartner(payload)
}

export async function updateAdminPartner(id: string, data: Partial<AdminPartnerItem>) {
  const payload = await portalRequest<any>(`/api/partners/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizePartner(payload)
}

export async function deleteAdminPartner(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/partners/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminProjects() {
  const payload = await portalRequest<any[]>('/api/projects')
  return payload.map(normalizeProject)
}

export async function createAdminProject(data: Partial<AdminProjectItem>) {
  const payload = await portalRequest<any>('/api/projects', { method: 'POST', body: JSON.stringify(data) })
  return normalizeProject(payload)
}

export async function updateAdminProject(id: string, data: Partial<AdminProjectItem>) {
  const payload = await portalRequest<any>(`/api/projects/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeProject(payload)
}

export async function deleteAdminProject(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminMedia() {
  const payload = await portalRequest<any[]>('/api/media')
  return payload.map(normalizeMedia)
}

export async function uploadAdminMedia(file: File) {
  const body = new FormData()
  body.append('file', file)
  const payload = await portalRequest<any>('/api/media/upload', { method: 'POST', body })
  return normalizeMedia(payload)
}

export async function deleteAdminMedia(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminBlogPosts() {
  const payload = await portalRequest<any[]>('/api/blog-posts')
  return payload.map(normalizeBlog)
}

export async function createAdminBlogPost(data: Partial<AdminBlogItem>) {
  const payload = await portalRequest<any>('/api/blog-posts', { method: 'POST', body: JSON.stringify(data) })
  return normalizeBlog(payload)
}

export async function updateAdminBlogPost(id: string, data: Partial<AdminBlogItem>) {
  const payload = await portalRequest<any>(`/api/blog-posts/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeBlog(payload)
}

export async function deleteAdminBlogPost(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/blog-posts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminFaqs() {
  const payload = await portalRequest<any[]>('/api/faqs')
  return payload.map(normalizeFaq)
}

export async function createAdminFaq(data: Partial<AdminFaqItem>) {
  const payload = await portalRequest<any>('/api/faqs', { method: 'POST', body: JSON.stringify(data) })
  return normalizeFaq(payload)
}

export async function updateAdminFaq(id: string, data: Partial<AdminFaqItem>) {
  const payload = await portalRequest<any>(`/api/faqs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeFaq(payload)
}

export async function deleteAdminFaq(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/faqs/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminCenters() {
  const payload = await portalRequest<any[]>('/api/centers')
  return payload.map(normalizeCenter)
}

export async function createAdminCenter(data: Partial<AdminCenterItem>) {
  const payload = await portalRequest<any>('/api/centers', { method: 'POST', body: JSON.stringify(data) })
  return normalizeCenter(payload)
}

export async function updateAdminCenter(id: string, data: Partial<AdminCenterItem>) {
  const payload = await portalRequest<any>(`/api/centers/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeCenter(payload)
}

export async function deleteAdminCenter(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/centers/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminFaculty() {
  const payload = await portalRequest<any[]>('/api/faculty')
  return payload.map(normalizeFaculty)
}

export async function createAdminFaculty(data: Partial<AdminFacultyItem>) {
  const payload = await portalRequest<any>('/api/faculty', { method: 'POST', body: JSON.stringify(data) })
  return normalizeFaculty(payload)
}

export async function updateAdminFaculty(id: string, data: Partial<AdminFacultyItem>) {
  const payload = await portalRequest<any>(`/api/faculty/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
  return normalizeFaculty(payload)
}

export async function deleteAdminFaculty(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/faculty/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAdminDepartments() {
  return portalRequest<AdminDepartmentOption[]>('/api/departments')
}
