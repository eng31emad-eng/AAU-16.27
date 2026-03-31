import About from './client';
import { getAboutPageData } from '@/services/server/about';

export const metadata = {
    title: 'About | Al-Jeel Al-Jadeed University',
    description: 'Learn about the vision, mission, and goals of Al-Jeel Al-Jadeed University.',
};

export default async function AboutPage() {
    const about = await getAboutPageData();
    return <About about={about} />;
}
