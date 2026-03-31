import { getAcademicProgramsCount, getCollegesList } from '@/services/server/colleges';
import CollegesPageContent from '@/components/CollegesPageContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'كلياتنا | Our Colleges',
  description: 'تعرف على كليات وبرامج جامعة الجيل الجديد - Discover Al-Jeel Al-Jadeed University Colleges and Programs',
};

export default async function CollegesPage() {
  const [colleges, academicProgramsCount] = await Promise.all([
    getCollegesList(),
    getAcademicProgramsCount(),
  ]);

  return (
    <CollegesPageContent initialColleges={colleges} academicProgramsCount={academicProgramsCount} />
  );
}


