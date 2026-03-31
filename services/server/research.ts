import { ResearchArticle } from '@/types';
import { resolveMediaUrl } from '@/services/shared/media-url';

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

function mapResearchArticle(item: any): ResearchArticle {
  return {
    id: String(item?.id || item?.name || ''),
    titleAr: String(item?.titleAr || item?.title || ''),
    titleEn: String(item?.titleEn || item?.titleAr || item?.title || ''),
    authorAr: String(item?.authorAr || ''),
    authorEn: String(item?.authorEn || item?.authorAr || ''),
    categoryAr: String(item?.categoryAr || 'البحث العلمي'),
    categoryEn: String(item?.categoryEn || 'Research'),
    summaryAr: String(item?.summaryAr || item?.contentAr || item?.content || ''),
    summaryEn: String(item?.summaryEn || item?.summaryAr || item?.contentEn || item?.contentAr || item?.content || ''),
    contentAr: String(item?.contentAr || item?.content || ''),
    contentEn: String(item?.contentEn || item?.contentAr || item?.content || ''),
    publishDateAr: String(item?.publishDateAr || item?.publishDate || ''),
    publishDateEn: String(item?.publishDateEn || item?.publishDateAr || item?.publishDate || ''),
    image: resolveMediaUrl(item?.image),
    tags: Array.isArray(item?.tags) ? item.tags : [],
  };
}

export async function getResearchArticles(): Promise<ResearchArticle[]> {
  try {
    const response = await fetch(`${API_BASE}/api/research-publications`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    const data = unwrapPayload(payload);
    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return items.map(mapResearchArticle);
  } catch {
    return [];
  }
}

export async function getResearchArticleById(id: string): Promise<ResearchArticle | null> {
  try {
    const response = await fetch(`${API_BASE}/api/research-publications/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return mapResearchArticle(unwrapPayload(payload));
  } catch {
    return null;
  }
}
