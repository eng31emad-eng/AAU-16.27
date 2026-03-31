import { getEventsList } from '@/services/server/events';
import EventsPageContent from '@/components/EventsPageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الفعاليات | Events',
  description: 'فعاليات وأنشطة جامعة الجيل الجديد - Al-Jeel Al-Jadeed University Events and Activities',
};

export default async function EventsPage() {
  const events = await getEventsList();

  return (
    <EventsPageContent initialEvents={events} />
  );
}




