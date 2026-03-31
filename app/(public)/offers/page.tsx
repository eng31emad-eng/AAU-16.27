import { getOffersList } from '@/services/server/offers';
import OffersPageContent from '@/components/OffersPageContent';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'عروض الجامعة | University Offers',
  description: 'أحدث العروض والفرص المتاحة لطلاب جامعة الجيل الجديد - Latest Offers and Opportunities for Al-Jeel Al-Jadeed Students',
};

export default async function OffersPage() {
  const offers = await getOffersList();

  return (
    <OffersPageContent initialOffers={offers} />
  );
}





