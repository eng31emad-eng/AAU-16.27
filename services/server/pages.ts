import { SitePage } from '@/types';

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '');

function unwrapPagePayload(payload: any) {
  if (payload?.ok && payload?.data) {
    return payload.data;
  }
  if (payload?.data?.ok && payload?.data?.data) {
    return payload.data.data;
  }
  return payload?.data || payload;
}

function mapPage(item: any): SitePage {
  return {
    slug: String(item?.slug || ''),
    titleAr: String(item?.titleAr || ''),
    titleEn: String(item?.titleEn || item?.titleAr || ''),
    contentAr: String(item?.contentAr || ''),
    contentEn: String(item?.contentEn || item?.contentAr || ''),
    heroImage: item?.heroImage || '',
  };
}

export async function getPublicPage(slug: string): Promise<SitePage | null> {
  try {
    const response = await fetch(`${API_BASE}/api/aau/page/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return mapPage(unwrapPagePayload(payload));
  } catch {
    return null;
  }
}
