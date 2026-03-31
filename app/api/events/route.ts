import { NextResponse } from 'next/server';
import { getEventsList } from '@/services/server/events';

export async function GET() {
    const events = await getEventsList();
    return NextResponse.json(events);
}
