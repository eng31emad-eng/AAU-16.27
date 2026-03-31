import FacultyPageContent from '@/components/FacultyPageContent';
import { Metadata } from 'next';
import { getFacultyList } from '@/services/server/faculty';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الكادر التعليمي | Faculty',
  description: 'نخبة من الأساتذة والدكاترة المتميزين في جامعة الجيل الجديد - Al-Jeel Al-Jadeed University Distinguished Faculty',
};

export default async function FacultyPage() {
  const members = await getFacultyList();

  return (
    <FacultyPageContent initialMembers={members} />
  );
}
