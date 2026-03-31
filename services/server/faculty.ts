import { FacultyMember, FacultyMemberDetail } from '@/types'
import { resolveMediaUrl } from '@/services/shared/media-url'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const FACULTY_LIST_ENDPOINT = '/api/faculty'
const FACULTY_DETAIL_ENDPOINT = '/api/faculty'

async function fetchFacultyJson(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Faculty API request failed: ${response.status}`)
  }

  return response.json()
}

function unwrapFacultyPayload(payload: any) {
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

function mapFacultyMember(item: any): FacultyMember {
  const departmentAr = String(item?.departmentAr || item?.specializationAr || '')
  const departmentEn = String(item?.departmentEn || item?.specializationEn || departmentAr)
  const degreeAr = String(item?.degreeAr || '')
  const degreeEn = String(item?.degreeEn || degreeAr)

  return {
    id: String(item?.id || ''),
    nameAr: String(item?.nameAr || ''),
    nameEn: String(item?.nameEn || item?.nameAr || ''),
    degreeAr,
    degreeEn,
    specializationAr: String(item?.specializationAr || departmentAr),
    specializationEn: String(item?.specializationEn || departmentEn),
    collegeAr: String(item?.collegeAr || departmentAr),
    collegeEn: String(item?.collegeEn || departmentEn),
    departmentAr,
    departmentEn,
    email: item?.email || '',
    phone: item?.phone || '',
    bioAr: item?.bioAr || '',
    bioEn: item?.bioEn || item?.bioAr || '',
    image: resolveMediaUrl(item?.image),
  }
}

function mapFacultyMemberDetail(item: any): FacultyMemberDetail {
  const base = mapFacultyMember(item)
  return {
    ...base,
    officeHoursAr: String(item?.officeHoursAr || ''),
    officeHoursEn: String(item?.officeHoursEn || item?.officeHoursAr || ''),
    researchInterestsAr: Array.isArray(item?.researchInterestsAr) ? item.researchInterestsAr : [],
    researchInterestsEn: Array.isArray(item?.researchInterestsEn) ? item.researchInterestsEn : [],
    publications: Array.isArray(item?.publications) ? item.publications : [],
    courses: Array.isArray(item?.courses) ? item.courses : [],
    education: Array.isArray(item?.education) ? item.education : [],
    experience: Array.isArray(item?.experience) ? item.experience : [],
  }
}

export async function getFacultyList(): Promise<FacultyMember[]> {
  try {
    const payload = await fetchFacultyJson(FACULTY_LIST_ENDPOINT)
    const data = unwrapFacultyPayload(payload)
    const items = Array.isArray(data) ? data : Array.isArray(payload) ? payload : []
    return items.map(mapFacultyMember)
  } catch {
    return []
  }
}

export async function getFacultyById(id: string): Promise<FacultyMemberDetail | null> {
  try {
    const payload = await fetchFacultyJson(`${FACULTY_DETAIL_ENDPOINT}/${encodeURIComponent(id)}`)
    const data = unwrapFacultyPayload(payload)
    return mapFacultyMemberDetail(data)
  } catch {
    return null
  }
}
