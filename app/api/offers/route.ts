import { NextResponse } from 'next/server';
import { getOffersList } from '@/services/server/offers';

export async function GET() {
    const items = await getOffersList();
    return NextResponse.json(items);
}
