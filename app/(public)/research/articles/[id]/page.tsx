import { notFound } from 'next/navigation';
import { getResearchArticleById, getResearchArticles } from '@/services/server/research';
import ArticleDetailsContent from '@/components/ArticleDetailsContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const article = await getResearchArticleById(id);

    if (!article) {
        return {
            title: 'Article Not Found',
        };
    }

    return {
        title: `${article.titleEn} | NGU Research`,
        description: article.summaryEn,
    };
}

export default async function ArticleDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const article = await getResearchArticleById(id);

    if (!article) {
        return notFound();
    }

    const allArticles = await getResearchArticles();
    const relatedArticles = allArticles
        .filter(a => a.id !== id && a.categoryEn === article.categoryEn)
        .slice(0, 3);

    return <ArticleDetailsContent article={article} relatedArticles={relatedArticles} />;
}
