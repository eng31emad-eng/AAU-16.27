import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjectsList } from '@/services/server/projects';
import ProjectDetailsContent from '@/components/ProjectDetailsContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
        return {
            title: 'Project Not Found',
        };
    }

    return {
        title: `${project.titleEn} | Projects`,
        description: project.descEn,
        openGraph: {
            title: `${project.titleEn} | Projects`,
            description: project.descEn,
        },
    };
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
        return notFound();
    }

    const allProjects = await getProjectsList();
    const relatedProjects = allProjects
        .filter(p => p.id !== project.id && p.status === project.status)
        .slice(0, 3);

    return <ProjectDetailsContent project={project} relatedProjects={relatedProjects} />;
}
