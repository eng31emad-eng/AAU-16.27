import { NextResponse } from 'next/server';
import { getCollegesList } from '@/services/server/colleges';

export async function GET() {
    const items = await getCollegesList();
    return NextResponse.json(items);
}
