import { cookies } from 'next/headers'

const API_BASE = (
  process.env.NEXT_PUBLIC_AAU_API_BASE_URL ||
  process.env.AAU_API_BASE_URL ||
  'https://edu.yemenfrappe.com'
).replace(/\/$/, '')

const ADMIN_DASHBOARD_ENDPOINT = '/api/admin/dashboard'

export interface AdminDashboardSummary {
  usersTotal: number
  newsTotal: number
  projectsTotal: number
  studentsTotal: number
}

export interface AdminDashboardQuickStats {
  dailyRegistrations: number
  pendingNews: number
  projectsUnderReview: number
  newQuestions: number
}

export interface AdminDashboardActivityItem {
  id: string
  type: string
  titleAr: string
  titleEn: string
  timestamp: string
  link: string
}

export interface AdminDashboardSnapshot {
  summary: AdminDashboardSummary
  quickStats: AdminDashboardQuickStats
  recentActivity: AdminDashboardActivityItem[]
  unauthorized?: boolean
}

function emptyDashboard(unauthorized = false): AdminDashboardSnapshot {
  return {
    summary: {
      usersTotal: 0,
      newsTotal: 0,
      projectsTotal: 0,
      studentsTotal: 0,
    },
    quickStats: {
      dailyRegistrations: 0,
      pendingNews: 0,
      projectsUnderReview: 0,
      newQuestions: 0,
    },
    recentActivity: [],
    unauthorized,
  }
}

function unwrapDashboardPayload(payload: any) {
  if (payload?.ok === true) {
    return payload.data
  }
  if (payload?.message?.ok === true) {
    return payload.message.data
  }
  if (payload?.data) {
    return payload.data
  }
  if (payload?.message?.data) {
    return payload.message.data
  }
  if (payload?.message) {
    return payload.message
  }
  return payload
}

function normalizeNumber(value: any) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeText(value: any) {
  return String(value || '').trim()
}

function mapDashboardPayload(payload: any): AdminDashboardSnapshot {
  const data = unwrapDashboardPayload(payload) || {}
  return {
    summary: {
      usersTotal: normalizeNumber(data?.summary?.usersTotal),
      newsTotal: normalizeNumber(data?.summary?.newsTotal),
      projectsTotal: normalizeNumber(data?.summary?.projectsTotal),
      studentsTotal: normalizeNumber(data?.summary?.studentsTotal),
    },
    quickStats: {
      dailyRegistrations: normalizeNumber(data?.quickStats?.dailyRegistrations),
      pendingNews: normalizeNumber(data?.quickStats?.pendingNews),
      projectsUnderReview: normalizeNumber(data?.quickStats?.projectsUnderReview),
      newQuestions: normalizeNumber(data?.quickStats?.newQuestions),
    },
    recentActivity: Array.isArray(data?.recentActivity)
      ? data.recentActivity.map((item: any) => ({
        id: normalizeText(item?.id),
        type: normalizeText(item?.type),
        titleAr: normalizeText(item?.titleAr),
        titleEn: normalizeText(item?.titleEn || item?.titleAr),
        timestamp: normalizeText(item?.timestamp),
        link: normalizeText(item?.link),
      }))
      : [],
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardSnapshot> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(`${API_BASE}${ADMIN_DASHBOARD_ENDPOINT}`, {
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: 'no-store',
    })

    const text = await response.text()
    const payload = text ? JSON.parse(text) : null

    if (response.status === 401 || response.status === 403 || payload?.ok === false) {
      return emptyDashboard(true)
    }

    if (!response.ok) {
      return emptyDashboard(false)
    }

    return mapDashboardPayload(payload)
  } catch {
    return emptyDashboard(false)
  }
}
