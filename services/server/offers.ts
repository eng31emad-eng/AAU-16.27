import { Offer } from '@/types';
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

function mapOffer(item: any): Offer {
  return {
    id: String(item?.id || item?.name || ''),
    titleAr: String(item?.title_ar || item?.titleAr || ''),
    titleEn: String(item?.title_en || item?.titleEn || item?.title_ar || item?.titleAr || ''),
    descAr: String(item?.desc_ar || item?.descAr || ''),
    descEn: String(item?.desc_en || item?.descEn || item?.desc_ar || item?.descAr || ''),
    image: resolveMediaUrl(item?.image),
    category: item?.category || 'other',
    validUntil: item?.valid_until || item?.validUntil || '',
    detailsAr: String(item?.details_ar || item?.detailsAr || ''),
    detailsEn: String(item?.details_en || item?.detailsEn || item?.details_ar || item?.detailsAr || ''),
    targetAudienceAr: String(item?.target_audience_ar || item?.targetAudienceAr || ''),
    targetAudienceEn: String(item?.target_audience_en || item?.targetAudienceEn || item?.target_audience_ar || item?.targetAudienceAr || ''),
    benefitsAr: String(item?.benefits_ar || item?.benefitsAr || ''),
    benefitsEn: String(item?.benefits_en || item?.benefitsEn || item?.benefits_ar || item?.benefitsAr || ''),
    durationAr: String(item?.duration_ar || item?.durationAr || ''),
    durationEn: String(item?.duration_en || item?.durationEn || item?.duration_ar || item?.durationAr || ''),
    locationAr: String(item?.location_ar || item?.locationAr || ''),
    locationEn: String(item?.location_en || item?.locationEn || item?.location_ar || item?.locationAr || ''),
    requirementsAr: String(item?.requirements_ar || item?.requirementsAr || ''),
    requirementsEn: String(item?.requirements_en || item?.requirementsEn || item?.requirements_ar || item?.requirementsAr || ''),
    applyLink: String(item?.apply_link || item?.applyLink || ''),
  };
}

export async function getOffersList(): Promise<Offer[]> {
  try {
    const response = await fetch(`${API_BASE}/api/offers`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    const data = unwrapEntityPayload(payload);
    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return items.map(mapOffer);
  } catch {
    return [];
  }
}

export async function getOfferById(id: string): Promise<Offer | null> {
  try {
    const response = await fetch(`${API_BASE}/api/offers/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return mapOffer(unwrapEntityPayload(payload));
  } catch {
    return null;
  }
}
