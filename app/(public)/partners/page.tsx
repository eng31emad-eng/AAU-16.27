import { getPartnersList } from '@/services/server/partners';
import PartnersPageContent from '@/components/PartnersPageContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'شركاؤنا | Our Partners',
  description: 'شركاء جامعة الجيل الجديد من المؤسسات المحلية والدولية - Al-Jeel Al-Jadeed University Partners',
};

export default async function PartnersPage() {
  const partners = await getPartnersList();

  return (
    <PartnersPageContent initialPartners={partners} />
  );
}





