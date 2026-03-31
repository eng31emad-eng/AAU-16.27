import CentersPageContent from '@/components/CentersPageContent';
import { Metadata } from 'next';
import { getCentersList } from '@/services/server/centers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'مراكز الجامعة | University Centers',
  description: 'المراكز البحثية والتدريبية في جامعة الجيل الجديد - Al-Jeel Al-Jadeed University Research and Training Centers',
};

export default async function CentersPage() {
  const centers = await getCentersList();

  return (
    <CentersPageContent initialCenters={centers} />
  );
}





