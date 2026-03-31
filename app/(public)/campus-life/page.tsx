import { getCampusLifeList } from '@/services/server/campus-life';
import CampusLifePageContent from '@/components/CampusLifePageContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الحياة الجامعية | Campus Life',
  description: 'استكشف الحياة الجامعية النابضة بالحيوية والمرافق الحديثة - Explore vibrant campus life and modern facilities',
};

export default async function CampusLifePage() {
  const items = await getCampusLifeList();

  return (
    <CampusLifePageContent initialItems={items} />
  );
}
