import { NextResponse } from 'next/server';
import { getProgramByIds } from '@/services/server/colleges';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; programId: string }> }
) {
    const { id, programId } = await params;
    const item = await getProgramByIds(id, programId);

    if (!item) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
}
