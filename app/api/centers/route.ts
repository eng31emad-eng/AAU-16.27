import { NextResponse } from 'next/server';
import { getCentersList } from '@/services/server/centers';

export async function GET() {
    const items = await getCentersList();
    return NextResponse.json(items);
}
