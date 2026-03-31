import { notFound } from 'next/navigation';
import { getEventsList, getEventBySlug } from '@/services/server/events';
import EventDetailsView from '@/components/events/EventDetailsView';

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const eventItem = await getEventBySlug(slug);

    if (!eventItem) {
        return notFound();
    }

    // Pass related events as well
    const allEvents = await getEventsList();
    const relatedEvents = allEvents
        .filter(e => e.slug !== slug && e.id !== slug)
        .slice(0, 3);

    return <EventDetailsView event={eventItem} relatedEvents={relatedEvents} />;
}
