import { NextResponse } from 'next/server';
import { getFacultyById } from '@/services/server/faculty';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const item = await getFacultyById(id);

    if (!item) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
}
