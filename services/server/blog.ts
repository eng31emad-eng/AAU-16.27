import { resolveMediaUrl } from '@/services/shared/media-url'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')

export type BlogPost = {
  id: string
  title: {
    ar: string
    en: string
  }
  excerpt: {
    ar: string
    en: string
  }
  content: {
    ar: string
    en: string
  }
  author: {
    name: {
      ar: string
      en: string
    }
    avatar: string
    role: {
      ar: string
      en: string
    }
  }
  category: {
    ar: string
    en: string
  }
  image: string
  publishedAt: string
  readTime: number
  tags: { ar: string; en: string }[]
}

function unwrapPayload(payload: any) {
  if (payload?.ok && payload?.data !== undefined) {
    return payload.data
  }
  if (payload?.data?.ok && payload?.data?.data !== undefined) {
    return payload.data.data
  }
  return payload?.data ?? payload
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function avatarPlaceholder(name: string) {
  const label = (name || 'AAU')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AA'

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#0f766e"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="700">${label}</text>
    </svg>
  `)
}

function normalizeTag(tag: any) {
  const value = String(tag?.ar || tag?.en || tag || '').trim()
  return value ? { ar: value, en: String(tag?.en || tag?.ar || tag || '').trim() || value } : null
}

function normalizeTags(tags: any) {
  if (Array.isArray(tags)) {
    return tags.map(normalizeTag).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => normalizeTag(tag))
      .filter(Boolean)
  }

  return []
}

function mapBlogPost(item: any): BlogPost {
  const authorNameAr = String(item?.authorNameAr || '').trim()
  const authorNameEn = String(item?.authorNameEn || authorNameAr || '').trim()
  const authorRoleAr = String(item?.authorRoleAr || 'هيئة التحرير').trim()
  const authorRoleEn = String(item?.authorRoleEn || authorRoleAr || 'Editorial Team').trim()
  const image = resolveMediaUrl(item?.image)
  const tags = normalizeTags(item?.tags)

  return {
    id: String(item?.id || item?.name || ''),
    title: {
      ar: String(item?.titleAr || ''),
      en: String(item?.titleEn || item?.titleAr || ''),
    },
    excerpt: {
      ar: String(item?.excerptAr || item?.descriptionAr || ''),
      en: String(item?.excerptEn || item?.excerptAr || item?.descriptionEn || item?.descriptionAr || ''),
    },
    content: {
      ar: String(item?.contentAr || ''),
      en: String(item?.contentEn || item?.contentAr || ''),
    },
    author: {
      name: {
        ar: authorNameAr || 'هيئة التحرير',
        en: authorNameEn || 'Editorial Team',
      },
      avatar: avatarPlaceholder(authorNameEn || authorNameAr || 'AAU'),
      role: {
        ar: authorRoleAr,
        en: authorRoleEn,
      },
    },
    category: {
      ar: String(item?.categoryAr || item?.category || 'عام'),
      en: String(item?.categoryEn || item?.categoryAr || item?.category || 'General'),
    },
    image: image || avatarPlaceholder(String(item?.titleEn || item?.titleAr || 'AAU')),
    publishedAt: String(item?.publishedAt || ''),
    readTime: Number(item?.readTime || 0),
    tags,
  }
}

async function fetchBlogJson(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Blog API request failed: ${response.status}`)
  }

  return response.json()
}

export async function getBlogList(): Promise<BlogPost[]> {
  try {
    const payload = await fetchBlogJson('/api/blog')
    const data = unwrapPayload(payload)
    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
    return items.map(mapBlogPost)
  } catch {
    return []
  }
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  try {
    const payload = await fetchBlogJson(`/api/blog/${encodeURIComponent(id)}`)
    return mapBlogPost(unwrapPayload(payload))
  } catch {
    return null
  }
}

export async function getBlogCategories(): Promise<{ ar: string; en: string }[]> {
  const posts = await getBlogList()
  const seen = new Set<string>()
  return posts
    .map((post) => post.category)
    .filter((category) => {
      const key = `${category.ar}::${category.en}`
      if (!category.ar && !category.en) return false
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
