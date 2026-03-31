import React from 'react';
import { notFound } from 'next/navigation';
import { getCollegesList, getCollegeById, getCollegeFaculty } from '@/services/server/colleges';
import CollegeDetailsContent from '@/components/CollegeDetailsContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const college = await getCollegeById(id);

    if (!college) {
        return {
            title: 'College Not Found',
        };
    }

    return {
        title: `${college.nameEn} | Colleges`,
        description: college.descriptionEn,
        openGraph: {
            title: `${college.nameEn} | Colleges`,
            description: college.descriptionEn,
            images: [college.image || ''],
        },
    };
}

export default async function CollegeDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const college = await getCollegeById(id);

    if (!college) {
        notFound();
    }

    const facultyMembers = await getCollegeFaculty(college);

    return <CollegeDetailsContent college={college} facultyMembers={facultyMembers} />;
}
