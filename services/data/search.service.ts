import { SearchResult } from '@/types';

function mapResult(item: any): SearchResult {
  return {
    id: String(item?.id || ''),
    type: item?.type || 'news',
    titleAr: String(item?.titleAr || ''),
    titleEn: String(item?.titleEn || item?.titleAr || ''),
    descriptionAr: String(item?.descriptionAr || ''),
    descriptionEn: String(item?.descriptionEn || item?.descriptionAr || ''),
    link: String(item?.link || '#'),
    image: item?.image || undefined,
  }
}

export const searchService = {
  search: async (query: string): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 2) {
      return Promise.resolve([]);
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      const results = Array.isArray(payload?.results) ? payload.results : [];
      return results.map(mapResult);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },
};
