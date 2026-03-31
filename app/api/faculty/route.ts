import { NextResponse } from 'next/server';
import { getFacultyList } from '@/services/server/faculty';

export async function GET() {
    const items = await getFacultyList();
    return NextResponse.json(items);
}
