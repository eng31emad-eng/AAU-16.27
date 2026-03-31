import Admission from './client';
import { getCollegesList } from '@/services/server/colleges';
import { getPublicPage } from '@/services/server/pages';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getPublicPage('admission');

  return {
    title: page?.titleEn || 'Admission | Al-Jeel Al-Jadeed University',
    description: page?.contentEn || 'Admission requirements and registration process.',
  };
}

export default async function AdmissionPage() {
  const page = await getPublicPage('admission');
  const colleges = await getCollegesList();
  return <Admission page={page} colleges={colleges} />;
}
