import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ngu.edu.iq'

    // Static pages
    const routes = [
        '',
        '/colleges',
        '/news',
        '/projects-studio',
        '/centers',
        '/admission',
        '/contact',
        '/about',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return routes
}
