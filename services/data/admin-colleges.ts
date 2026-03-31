'use client'

import type { AcademicProgram, College } from '@/types'
import { portalRequest } from './portal-api'

type CollegePayload = {
  college_name: string
  slug?: string
  name_ar?: string
  name_en?: string
  description?: string
  description_ar?: string
  description_en?: string
  vision_ar?: string
  vision_en?: string
  mission_ar?: string
  mission_en?: string
  admission_requirements_ar?: string
  admission_requirements_en?: string
  image?: string
  icon?: string
  dean_name?: string
  is_active?: number
  display_order?: number
}

type ProgramPayload = {
  program_name: string
  degree_type?: string
  description?: string
  duration?: string
  college: string
  is_active?: number
}

function safeString(value: any) {
  return String(value || '').trim()
}

function safeNumber(value: any) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function parseProgramsJson(raw: any): AcademicProgram[] {
  if (!raw) return []
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: any) => ({
      id: safeString(item?.id || item?.docname || item?.name || crypto.randomUUID?.() || Math.random().toString(36).slice(2)),
      nameAr: safeString(item?.nameAr || item?.programName || item?.program_name),
      nameEn: safeString(item?.nameEn || item?.programName || item?.program_name),
      departmentAr: safeString(item?.departmentAr || item?.department_ar),
      departmentEn: safeString(item?.departmentEn || item?.department_en),
      admissionRate: safeNumber(item?.admissionRate),
      highSchoolType: (item?.highSchoolType || 'علمي') as AcademicProgram['highSchoolType'],
      highSchoolTypeEn: (item?.highSchoolTypeEn || 'Scientific') as AcademicProgram['highSchoolTypeEn'],
      studyYears: safeString(item?.studyYears || item?.duration),
      image: item?.image || '',
      descriptionAr: safeString(item?.descriptionAr || item?.description),
      descriptionEn: safeString(item?.descriptionEn || item?.description),
      objectives: Array.isArray(item?.objectives) ? item.objectives : [],
      careerProspectsAr: Array.isArray(item?.careerProspectsAr) ? item.careerProspectsAr : [],
      careerProspectsEn: Array.isArray(item?.careerProspectsEn) ? item.careerProspectsEn : [],
      facultyMembers: Array.isArray(item?.facultyMembers) ? item.facultyMembers : [],
    }))
  } catch {
    return []
  }
}

function normalizeProgram(item: any): AcademicProgram {
  return {
    id: safeString(item?.id || item?.docname),
    nameAr: safeString(item?.nameAr || item?.programName || item?.program_name),
    nameEn: safeString(item?.nameEn || item?.programName || item?.program_name),
    departmentAr: '',
    departmentEn: '',
    degreeType: safeString(item?.degreeType || item?.degree_type),
    admissionRate: 0,
    highSchoolType: 'علمي',
    highSchoolTypeEn: 'Scientific',
    studyYears: safeString(item?.studyYears || item?.duration),
    image: '',
    descriptionAr: safeString(item?.descriptionAr || item?.description),
    descriptionEn: safeString(item?.descriptionEn || item?.description),
    objectives: [],
    careerProspectsAr: [],
    careerProspectsEn: [],
    facultyMembers: [],
  }
}

function normalizeCollege(item: any, programs: AcademicProgram[]): College {
  return {
    id: safeString(item?.id || item?.docname),
    slug: safeString(item?.slug || item?.nameEn || item?.nameAr || item?.collegeName).toLowerCase().replace(/\s+/g, '-'),
    nameAr: safeString(item?.nameAr || item?.collegeName),
    nameEn: safeString(item?.nameEn || item?.collegeName),
    descriptionAr: safeString(item?.descriptionAr || item?.description),
    descriptionEn: safeString(item?.descriptionEn || item?.description),
    visionAr: safeString(item?.visionAr),
    visionEn: safeString(item?.visionEn),
    missionAr: safeString(item?.missionAr),
    missionEn: safeString(item?.missionEn),
    goalsAr: safeString(item?.goalsAr),
    goalsEn: safeString(item?.goalsEn),
    valuesAr: '',
    valuesEn: '',
    qualityAr: '',
    qualityEn: '',
    strategyAr: '',
    strategyEn: '',
    admissionRequirementsAr: safeString(item?.admissionRequirementsAr),
    admissionRequirementsEn: safeString(item?.admissionRequirementsEn),
    icon: item?.icon || '',
    image: item?.image || '',
    news: [],
    programs,
  }
}

export async function getAdminColleges() {
  const [collegesRaw, programsRaw] = await Promise.all([
    portalRequest<any[]>('/api/colleges'),
    portalRequest<any[]>('/api/programs'),
  ])

  const normalizedPrograms = programsRaw.map(normalizeProgram)
  const groupedPrograms = new Map<string, AcademicProgram[]>()
  normalizedPrograms.forEach((program, index) => {
    const collegeKey = safeString(programsRaw[index]?.college)
    if (!collegeKey) return
    const current = groupedPrograms.get(collegeKey) || []
    current.push(program)
    groupedPrograms.set(collegeKey, current)
  })

  return collegesRaw.map((item) => {
    const docname = safeString(item?.docname || item?.id)
    const directPrograms = parseProgramsJson(item?.programsJson)
    const linkedPrograms = groupedPrograms.get(docname) || []
    const programs = linkedPrograms.length > 0 ? linkedPrograms : directPrograms
    return normalizeCollege(item, programs)
  })
}

export async function createCollege(data: CollegePayload) {
  return portalRequest<any>('/api/colleges', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCollege(id: string, data: Partial<CollegePayload>) {
  return portalRequest<any>(`/api/colleges/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCollege(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/colleges/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function createProgram(data: ProgramPayload) {
  return portalRequest<any>('/api/programs', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProgram(id: string, data: Partial<ProgramPayload>) {
  return portalRequest<any>(`/api/programs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProgram(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/programs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
