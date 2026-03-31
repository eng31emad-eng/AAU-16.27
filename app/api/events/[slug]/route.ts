import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/server/events';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(event);
}
