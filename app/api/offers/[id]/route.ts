import { NextResponse } from 'next/server';
import { getOfferById } from '@/services/server/offers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const item = await getOfferById(id);

    if (!item) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
}
