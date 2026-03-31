import { CampusLifeItem } from '@/types';
import { resolveMediaUrl } from '@/services/shared/media-url';

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '');

const CAMPUS_LIFE_LEGACY_SLUG_MAP: Record<string, string> = {
  'central-library': 'المكتبة-المركزية',
  'scientific-laboratories': 'المختبرات-العلمية',
  'sports-fields': 'الملاعب-الرياضية',
  'student-club': 'النادي-الطلابي',
  'health-center': 'المركز-الصحي',
  'restaurants-cafeterias': 'المطاعم-والكافتيريات',
};

const CAMPUS_LIFE_ARABIC_SLUG_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CAMPUS_LIFE_LEGACY_SLUG_MAP).map(([legacy, arabic]) => [arabic, legacy]),
);

const CAMPUS_LIFE_FALLBACK_ITEMS: CampusLifeItem[] = [
  {
    id: 'fallback-library',
    slug: 'المكتبة-المركزية',
    titleAr: 'المكتبة المركزية',
    titleEn: 'Central Library',
    descriptionAr: 'مكتبة حديثة مجهزة بالمراجع العلمية وقاعات الدراسة الهادئة.',
    descriptionEn: 'A modern library with scientific references and quiet study halls.',
    contentAr: 'مكتبة حديثة مجهزة بالمراجع العلمية وقاعات الدراسة الهادئة وخدمات البحث الأكاديمي.',
    contentEn: 'A modern library equipped with scientific references, quiet study halls, and academic research services.',
    category: 'facilities',
    image: '/images/campus/library-new.jpg',
  },
  {
    id: 'fallback-labs',
    slug: 'المختبرات-العلمية',
    titleAr: 'المختبرات العلمية',
    titleEn: 'Scientific Laboratories',
    descriptionAr: 'مختبرات عملية وتجريبية لدعم التعلم التطبيقي.',
    descriptionEn: 'Practical and experimental labs supporting applied learning.',
    contentAr: 'مختبرات عملية وتجريبية مجهزة لدعم التعلم التطبيقي والبحث العلمي.',
    contentEn: 'Well-equipped practical and experimental labs for applied learning and research.',
    category: 'facilities',
    image: '/images/campus/scientific-laboratories.jpg',
  },
  {
    id: 'fallback-sports',
    slug: 'الملاعب-الرياضية',
    titleAr: 'الملاعب الرياضية',
    titleEn: 'Sports Fields',
    descriptionAr: 'مرافق رياضية متكاملة لدعم النشاط البدني والترفيهي.',
    descriptionEn: 'Integrated sports facilities for physical and recreational activities.',
    contentAr: 'مرافق رياضية متكاملة لدعم النشاط البدني والترفيهي للطلاب.',
    contentEn: 'Integrated sports facilities that support students’ physical and recreational activities.',
    category: 'activities',
    image: '/images/campus/sports-fields-new.jpg',
  },
  {
    id: 'fallback-club',
    slug: 'النادي-الطلابي',
    titleAr: 'النادي الطلابي',
    titleEn: 'Student Club',
    descriptionAr: 'مساحة للأنشطة الطلابية الثقافية والاجتماعية.',
    descriptionEn: 'A space for student cultural and social activities.',
    contentAr: 'مساحة للأنشطة الطلابية الثقافية والاجتماعية وتنمية المهارات.',
    contentEn: 'A space for student cultural and social activities and skills development.',
    category: 'activities',
    image: '/images/campus/scientific-club-new.jpg',
  },
  {
    id: 'fallback-health',
    slug: 'المركز-الصحي',
    titleAr: 'المركز الصحي',
    titleEn: 'Health Center',
    descriptionAr: 'خدمات صحية أولية ورعاية طبية داخل الحرم الجامعي.',
    descriptionEn: 'Primary healthcare services inside campus.',
    contentAr: 'خدمات صحية أولية ورعاية طبية للطلاب ومنسوبي الجامعة.',
    contentEn: 'Primary healthcare and medical support for students and university staff.',
    category: 'campus',
    image: '/images/campus/health-center-new.jpg',
  },
  {
    id: 'fallback-dining',
    slug: 'المطاعم-والكافتيريات',
    titleAr: 'المطاعم والكافتيريات',
    titleEn: 'Restaurants & Cafeterias',
    descriptionAr: 'خيارات غذائية متنوعة داخل الحرم الجامعي.',
    descriptionEn: 'Various dining options inside campus.',
    contentAr: 'خيارات غذائية متنوعة وصحية داخل الحرم الجامعي.',
    contentEn: 'Various and healthy dining options across campus.',
    category: 'campus',
    image: '/images/campus/cafeteria-new.jpg',
  },
];

function unwrapPayload(payload: any) {
  if (payload?.ok && payload?.data !== undefined) {
    return payload.data;
  }
  if (payload?.data?.ok && payload?.data?.data !== undefined) {
    return payload.data.data;
  }
  return payload?.data ?? payload;
}

function mapCampusLifeItem(item: any): CampusLifeItem {
  const rawSlug = String(item?.slug || item?.id || item?.name || '').trim();
  const normalizedInputSlug = rawSlug.toLowerCase();
  const canonicalSlug = CAMPUS_LIFE_LEGACY_SLUG_MAP[normalizedInputSlug]
    ? CAMPUS_LIFE_LEGACY_SLUG_MAP[normalizedInputSlug]
    : rawSlug;
  const publicSlug = CAMPUS_LIFE_ARABIC_SLUG_MAP[canonicalSlug] || rawSlug;

  const category = String(item?.category || 'campus');
  const normalizedCategory: CampusLifeItem['category'] =
    category === 'activities' || category === 'facilities' || category === 'campus'
      ? category
      : 'campus';

  return {
    id: String(item?.id || item?.name || ''),
    slug: publicSlug,
    titleAr: String(item?.titleAr || item?.title || ''),
    titleEn: String(item?.titleEn || item?.titleAr || item?.title || ''),
    descriptionAr: String(item?.descriptionAr || item?.contentAr || item?.content || ''),
    descriptionEn: String(item?.descriptionEn || item?.descriptionAr || item?.contentEn || item?.contentAr || item?.content || ''),
    contentAr: String(item?.contentAr || item?.content || ''),
    contentEn: String(item?.contentEn || item?.contentAr || item?.content || ''),
    category: normalizedCategory,
    image: resolveMediaUrl(item?.image),
  };
}

function getCampusLifeFallbackBySlug(slug: string): CampusLifeItem | null {
  const normalizedInputSlug = String(slug || '').trim().toLowerCase();
  const mappedArabicSlug = CAMPUS_LIFE_LEGACY_SLUG_MAP[normalizedInputSlug] || slug;
  return (
    CAMPUS_LIFE_FALLBACK_ITEMS.find((item) => {
      const itemSlug = String(item.slug || '').trim();
      return itemSlug === slug || itemSlug === mappedArabicSlug || CAMPUS_LIFE_ARABIC_SLUG_MAP[itemSlug] === normalizedInputSlug;
    }) || null
  );
}

function mergeCampusLifeWithFallback(items: CampusLifeItem[]): CampusLifeItem[] {
  const bySlug = new Map<string, CampusLifeItem>();
  const canonicalSlug = (slug: string): string => {
    const normalized = String(slug || '').trim().toLowerCase();
    if (CAMPUS_LIFE_LEGACY_SLUG_MAP[normalized]) {
      return CAMPUS_LIFE_LEGACY_SLUG_MAP[normalized];
    }
    return String(slug || '').trim();
  };

  for (const fallback of CAMPUS_LIFE_FALLBACK_ITEMS) {
    bySlug.set(canonicalSlug(fallback.slug), fallback);
  }

  for (const item of items) {
    const slug = canonicalSlug(item.slug);
    if (!slug) continue;
    const fallback = bySlug.get(slug);
    if (fallback) {
      bySlug.set(slug, {
        ...fallback,
        ...item,
        image: item.image || fallback.image,
        contentAr: item.contentAr || fallback.contentAr,
        contentEn: item.contentEn || fallback.contentEn,
        descriptionAr: item.descriptionAr || fallback.descriptionAr,
        descriptionEn: item.descriptionEn || fallback.descriptionEn,
      });
      continue;
    }
    bySlug.set(slug, item);
  }

  return Array.from(bySlug.values()).sort((a, b) => {
    const ai = CAMPUS_LIFE_FALLBACK_ITEMS.findIndex((x) => x.slug === a.slug);
    const bi = CAMPUS_LIFE_FALLBACK_ITEMS.findIndex((x) => x.slug === b.slug);
    const av = ai === -1 ? 999 : ai;
    const bv = bi === -1 ? 999 : bi;
    return av - bv;
  });
}

export async function getCampusLifeList(): Promise<CampusLifeItem[]> {
  try {
    const response = await fetch(`${API_BASE}/api/campus-life`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return CAMPUS_LIFE_FALLBACK_ITEMS;
    }
    const payload = await response.json();
    const data = unwrapPayload(payload);
    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return mergeCampusLifeWithFallback(items.map(mapCampusLifeItem));
  } catch {
    return CAMPUS_LIFE_FALLBACK_ITEMS;
  }
}

export async function getCampusLifeItemBySlug(slug: string): Promise<CampusLifeItem | null> {
  try {
    const normalizedInputSlug = String(slug || '').trim().toLowerCase();
    const resolvedSlug = CAMPUS_LIFE_LEGACY_SLUG_MAP[normalizedInputSlug] || slug;

    const response = await fetch(`${API_BASE}/api/campus-life/${encodeURIComponent(resolvedSlug)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (response.ok) {
      const payload = await response.json();
      return mapCampusLifeItem(unwrapPayload(payload));
    }

    // Fallback: search in list by known legacy slug map or exact slug match.
    const items = await getCampusLifeList();
    if (!items.length) {
      return getCampusLifeFallbackBySlug(slug);
    }

    const mappedArabicSlug = CAMPUS_LIFE_LEGACY_SLUG_MAP[normalizedInputSlug];
    const match = items.find((item) => {
      const itemSlug = String(item.slug || '').trim();
      const itemSlugLower = itemSlug.toLowerCase();
      return (
        itemSlug === slug ||
        itemSlugLower === normalizedInputSlug ||
        itemSlug === resolvedSlug ||
        (mappedArabicSlug && (itemSlug === mappedArabicSlug || itemSlugLower === mappedArabicSlug.toLowerCase()))
      );
    });

    return match || getCampusLifeFallbackBySlug(slug);
  } catch {
    return getCampusLifeFallbackBySlug(slug);
  }
}
