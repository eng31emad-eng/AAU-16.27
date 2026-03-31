import { notFound } from 'next/navigation';
import { getCampusLifeItemBySlug, getCampusLifeList } from '@/services/server/campus-life';
import CampusLifeDetailsContent from '@/components/CampusLifeDetailsContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = await getCampusLifeItemBySlug(slug);

    if (!item) {
        return {
            title: 'Item Not Found',
        };
    }

    return {
        title: `${item.titleEn} | Campus Life`,
        description: item.descriptionEn,
        openGraph: {
            title: `${item.titleEn} | Campus Life`,
            description: item.descriptionEn,
        },
    };
}

export default async function CampusLifeDetailsPage({ params }: PageProps) {
    const { slug } = await params;
    const item = await getCampusLifeItemBySlug(slug);

    if (!item) {
        return notFound();
    }

    const allItems = await getCampusLifeList();
    const relatedItems = allItems.filter(i => i.id !== item.id && i.category === item.category).slice(0, 2);

    return <CampusLifeDetailsContent item={item} relatedItems={relatedItems} />;
}
