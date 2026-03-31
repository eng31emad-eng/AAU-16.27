import ArticlesClient from './client';
import { getResearchArticles } from '@/services/server/research';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Scientific Articles | Al-Jeel Al-Jadeed University',
    description: 'Explore the latest research papers, essays, and scientific output from the faculty members of Al-Jeel Al-Jadeed University.',
};

export default async function ArticlesPage() {
    const articles = await getResearchArticles();
    return <ArticlesClient initialArticles={articles} />;
}
