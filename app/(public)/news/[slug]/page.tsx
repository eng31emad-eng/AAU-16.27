import { notFound } from 'next/navigation';
import { getNewsList, getNewsBySlug } from '@/services/server/news';
import NewsDetailsView from '@/components/news/NewsDetailsView';

export default async function NewsDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const newsItem = await getNewsBySlug(slug);

    if (!newsItem) {
        return notFound();
    }

    // Pass related news as well to support server-side fetching for the sidebar
    const allNews = await getNewsList();
    const relatedNews = allNews
        .filter(n => n.id !== slug && n.slug !== slug)
        .slice(0, 3);

    return <NewsDetailsView news={newsItem} relatedNews={relatedNews} />;
}
