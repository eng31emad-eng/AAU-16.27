import { PartnerItem } from '@/types';
import { resolveMediaUrl } from '@/services/shared/media-url';

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '');

function unwrapEntityPayload(payload: any) {
  if (payload?.ok && payload?.data !== undefined) {
    return payload.data;
  }
  if (payload?.data?.ok && payload?.data?.data !== undefined) {
    return payload.data.data;
  }
  return payload?.data ?? payload;
}

function inferPartnerType(item: any): 'local' | 'international' {
  const raw = String(item?.type || item?.partner_type || '').toLowerCase();
  if (raw.includes('inter')) {
    return 'international';
  }
  return 'local';
}

function mapPartner(item: any): PartnerItem {
  const title = String(item?.title || item?.name || '');
  return {
    id: String(item?.id || item?.name || title),
    nameAr: title,
    nameEn: String(item?.title_en || item?.name_en || title),
    logo: resolveMediaUrl(item?.image || item?.logo),
    type: inferPartnerType(item),
    website: String(item?.website || item?.link || ''),
  };
}

export async function getPartnersList(): Promise<PartnerItem[]> {
  try {
    const response = await fetch(`${API_BASE}/api/partners`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    const data = unwrapEntityPayload(payload);
    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return items.map(mapPartner);
  } catch {
    return [];
  }
}
