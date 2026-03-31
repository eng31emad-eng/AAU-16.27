import JournalClient from './client';
import { getResearchArticles } from '@/services/server/research';

export const metadata = {
    title: 'Scientific Journal | Al-Jeel Al-Jadeed University',
    description: 'NGU Scientific Journal - A peer-reviewed platform for distinguished academic research across multiple disciplines.',
};

export default async function JournalPage() {
    const articles = await getResearchArticles();
    return <JournalClient initialArticles={articles} />;
}
