import { College, FacultyMember } from '@/types';
import { resolveMediaUrl } from '@/services/shared/media-url'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const COLLEGES_LIST_ENDPOINT = '/api/aau/colleges'
const COLLEGES_DETAIL_ENDPOINT = '/api/aau/colleges'
const PROGRAMS_LIST_ENDPOINT = '/api/programs?limit=500'
const COLLEGE_PROGRAMS_ENDPOINT = '/api/colleges'

async function fetchCollegesJson(path: string) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error(`Colleges API request failed: ${response.status}`)
    }

    return response.json()
}

function unwrapCollegePayload(payload: any) {
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

function normalizeCollegeId(value: any) {
    return String(value || '').trim()
}

function mapProgram(program: any) {
    return {
        id: String(program?.id || program?.name || program?.programName || ''),
        nameAr: String(program?.nameAr || program?.programName || ''),
        nameEn: String(program?.nameEn || program?.programName || program?.nameAr || ''),
        departmentAr: String(program?.departmentAr || ''),
        departmentEn: String(program?.departmentEn || program?.departmentAr || ''),
        degreeType: String(program?.degreeType || ''),
        admissionRate: Number(program?.admissionRate || 0),
        highSchoolType: program?.highSchoolType || 'علمي',
        highSchoolTypeEn: program?.highSchoolTypeEn || 'Scientific',
        studyYears: String(program?.studyYears || program?.duration || ''),
        image: resolveMediaUrl(program?.image),
        descriptionAr: String(program?.descriptionAr || program?.description || ''),
        descriptionEn: String(program?.descriptionEn || program?.descriptionAr || program?.description || ''),
        objectives: [],
        studyPlan: [],
        careerProspectsAr: [],
        careerProspectsEn: [],
        facultyMembers: [],
    }
}

function mapFacultyMember(item: any): FacultyMember {
    return {
        id: String(item?.id || ''),
        nameAr: String(item?.nameAr || ''),
        nameEn: String(item?.nameEn || item?.nameAr || ''),
        degreeAr: String(item?.degreeAr || ''),
        degreeEn: String(item?.degreeEn || item?.degreeAr || ''),
        specializationAr: String(item?.specializationAr || item?.departmentAr || ''),
        specializationEn: String(item?.specializationEn || item?.departmentEn || item?.specializationAr || ''),
        collegeAr: String(item?.collegeAr || ''),
        collegeEn: String(item?.collegeEn || item?.collegeAr || ''),
        departmentAr: String(item?.departmentAr || ''),
        departmentEn: String(item?.departmentEn || item?.departmentAr || ''),
        email: String(item?.email || ''),
        phone: String(item?.phone || ''),
        bioAr: String(item?.bioAr || ''),
        bioEn: String(item?.bioEn || item?.bioAr || ''),
        image: resolveMediaUrl(item?.image),
    }
}

function mapCollege(item: any): College {
    const fallbackName = String(item?.collegeName || item?.nameAr || item?.nameEn || item?.title || '').trim()
    const fallbackId = normalizeCollegeId(item?.slug || item?.id || item?.name || fallbackName)

    return {
        id: fallbackId,
        slug: fallbackId,
        collegeName: fallbackName,
        nameAr: String(item?.nameAr || item?.collegeName || ''),
        nameEn: String(item?.nameEn || item?.collegeName || item?.nameAr || ''),
        deanNameAr: String(item?.deanName || ''),
        deanNameEn: String(item?.deanNameEn || item?.deanName || ''),
        descriptionAr: String(item?.descriptionAr || ''),
        descriptionEn: String(item?.descriptionEn || item?.descriptionAr || ''),
        visionAr: String(item?.visionAr || ''),
        visionEn: String(item?.visionEn || item?.visionAr || ''),
        missionAr: String(item?.missionAr || ''),
        missionEn: String(item?.missionEn || item?.missionAr || ''),
        goalsAr: String(item?.goalsAr || ''),
        goalsEn: String(item?.goalsEn || item?.goalsAr || ''),
        valuesAr: String(item?.valuesAr || ''),
        valuesEn: String(item?.valuesEn || item?.valuesAr || ''),
        qualityAr: String(item?.qualityAr || ''),
        qualityEn: String(item?.qualityEn || item?.qualityAr || ''),
        strategyAr: String(item?.strategyAr || ''),
        strategyEn: String(item?.strategyEn || item?.strategyAr || ''),
        admissionRequirementsAr: String(item?.admissionRequirementsAr || ''),
        admissionRequirementsEn: String(item?.admissionRequirementsEn || item?.admissionRequirementsAr || ''),
        icon: item?.icon || '',
        image: resolveMediaUrl(item?.image),
        programs: Array.isArray(item?.programs) ? item.programs.map(mapProgram) : [],
        news: [],
    }
}

export async function getCollegesList(): Promise<College[]> {
    try {
        const payload = await fetchCollegesJson(COLLEGES_LIST_ENDPOINT)
        const data = unwrapCollegePayload(payload)
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(payload?.items) ? payload.items : []

        return items
            .map(mapCollege)
            .filter((college) => Boolean(college.id && (college.nameAr || college.nameEn || college.collegeName)))
    } catch {
        return []
    }
}

export async function getCollegeById(id: string): Promise<College | null> {
    try {
        const [payload, programsPayload] = await Promise.all([
            fetchCollegesJson(`${COLLEGES_DETAIL_ENDPOINT}/${encodeURIComponent(id)}`),
            fetchCollegesJson(`${COLLEGE_PROGRAMS_ENDPOINT}/${encodeURIComponent(id)}/programs`),
        ])
        const data = unwrapCollegePayload(payload)
        const programsData = unwrapCollegePayload(programsPayload)
        const programs = Array.isArray(programsData) ? programsData : Array.isArray(programsData?.items) ? programsData.items : []
        return {
            ...mapCollege(data),
            programs: programs.map(mapProgram),
        }
    } catch {
        return null
    }
}

export async function getCollegeFaculty(_college: College): Promise<FacultyMember[]> {
    try {
        const payload = await fetchCollegesJson(`${COLLEGE_PROGRAMS_ENDPOINT}/${encodeURIComponent(_college.id)}/faculty`)
        const data = unwrapCollegePayload(payload)
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        return items.map(mapFacultyMember)
    } catch {
        return []
    }
}

export async function getProgramByIds(collegeId: string, programId: string) {
    const college = await getCollegeById(collegeId)
    if (!college) {
        return null
    }

    const program = college.programs.find((entry) => entry.id === programId) || null
    if (!program) {
        return null
    }

    return { college, program }
}

export async function getProgramsForCollege(collegeId: string) {
    try {
        const payload = await fetchCollegesJson(`${COLLEGE_PROGRAMS_ENDPOINT}/${encodeURIComponent(collegeId)}/programs`)
        const data = unwrapCollegePayload(payload)
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        return items.map(mapProgram)
    } catch {
        return []
    }
}

export async function getAcademicProgramsCount(): Promise<number> {
    try {
        const payload = await fetchCollegesJson(PROGRAMS_LIST_ENDPOINT)
        const data = unwrapCollegePayload(payload)
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

        return items.filter((program) => {
            const isActive = Number(program?.isActive ?? program?.is_active ?? 0) === 1
            const college = String(program?.college || '').trim()
            return isActive && Boolean(college)
        }).length
    } catch {
        return 0
    }
}
