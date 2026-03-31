import { getCompletedProjects, getCurrentProjects, getStudioProjects } from '@/services/server/projects';
import ProjectsStudioPageContent from '@/components/ProjectsStudioPageContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'مشاريع التخرج | Graduation Projects',
  description: 'مشاريع التخرج المبتكرة لطلاب جامعة الجيل الجديد - Al-Jeel Al-Jadeed University Graduation Projects Gallery',
};

export default async function ProjectsStudioPage() {
  const current = await getCurrentProjects();
  const completed = await getCompletedProjects();
  const studio = await getStudioProjects();

  return (
    <ProjectsStudioPageContent
      initialCurrentProjects={current}
      initialCompletedProjects={completed}
      initialStudioProjects={studio}
    />
  );
}





