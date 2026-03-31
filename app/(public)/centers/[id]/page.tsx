import { notFound } from 'next/navigation';
import { getCentersList, getCenterById } from '@/services/server/centers';
import CenterDetailsContent from '@/components/CenterDetailsContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const center = await getCenterById(id);

    if (!center) {
        return {
            title: 'Center Not Found',
        };
    }

    return {
        title: `${center.titleEn} | Centers`,
        description: center.descEn,
        openGraph: {
            title: `${center.titleEn} | Centers`,
            description: center.descEn,
            images: [center.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
        },
    };
}

export default async function CenterDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const center = await getCenterById(id);

    if (!center) {
        return notFound();
    }

    const allCenters = await getCentersList();
    const relatedCenters = allCenters.filter(c => c.id !== id).slice(0, 3);

    return <CenterDetailsContent center={center} relatedCenters={relatedCenters} />;
}
