import { notFound } from 'next/navigation';
import { getFacultyList, getFacultyById } from '@/services/server/faculty';
import FacultyMemberDetailsContent from '@/components/FacultyMemberDetailsContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const member = await getFacultyById(id);

    if (!member) {
        return {
            title: 'Faculty Member Not Found',
        };
    }

    return {
        title: `${member.nameEn} | Faculty`,
        description: member.bioEn,
        openGraph: {
            title: `${member.nameEn} | Faculty`,
            description: member.bioEn,
            images: [member.image || ''],
        },
    };
}

export default async function FacultyMemberDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const member = await getFacultyById(id);

    if (!member) {
        notFound();
    }

    return <FacultyMemberDetailsContent member={member} />;
}
