import { ProjectItem } from '@/types';

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '');

function unwrapPayload(payload: any) {
  if (payload?.ok && payload?.data !== undefined) {
    return payload.data;
  }
  if (payload?.data?.ok && payload?.data?.data !== undefined) {
    return payload.data.data;
  }
  return payload?.data ?? payload;
}

function mapProject(item: any): ProjectItem {
  const rawStatus = String(item?.status || 'completed').toLowerCase();
  const status: ProjectItem['status'] = rawStatus === 'current' ? 'current' : 'completed';

  return {
    id: String(item?.id || item?.name || ''),
    slug: String(item?.slug || item?.id || item?.name || ''),
    titleAr: String(item?.titleAr || item?.title_ar || ''),
    titleEn: String(item?.titleEn || item?.title_en || item?.titleAr || item?.title_ar || ''),
    descAr: String(item?.descAr || item?.desc_ar || ''),
    descEn: String(item?.descEn || item?.desc_en || item?.descAr || item?.desc_ar || ''),
    students: Array.isArray(item?.students) ? item.students : [],
    progress: item?.progress === undefined || item?.progress === null ? undefined : Number(item.progress),
    year: item?.year === undefined || item?.year === null || item?.year === '' ? undefined : Number(item.year),
    status,
    type: 'graduation',
    categoryAr: String(item?.categoryAr || ''),
    categoryEn: String(item?.categoryEn || item?.categoryAr || ''),
    images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
    detailsAr: String(item?.detailsAr || item?.details_ar || ''),
    detailsEn: String(item?.detailsEn || item?.details_en || item?.detailsAr || item?.details_ar || ''),
    startDate: String(item?.startDate || item?.start_date || ''),
    endDate: String(item?.endDate || item?.end_date || ''),
  };
}

async function fetchProjectList(path: string): Promise<ProjectItem[]> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    const data = unwrapPayload(payload);
    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return items.map(mapProject);
  } catch {
    return [];
  }
}

export function getProjectsList(): Promise<ProjectItem[]> {
  return fetchProjectList('/api/projects');
}

export function getCurrentProjects(): Promise<ProjectItem[]> {
  return fetchProjectList('/api/projects/current');
}

export function getCompletedProjects(): Promise<ProjectItem[]> {
  return fetchProjectList('/api/projects/completed');
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  try {
    const response = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return mapProject(unwrapPayload(payload));
  } catch {
    return null;
  }
}

export async function getStudioProjects(): Promise<ProjectItem[]> {
  return [];
}
