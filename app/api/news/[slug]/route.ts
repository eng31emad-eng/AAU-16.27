import { NextResponse } from 'next/server';
import { getNewsBySlug } from '@/services/server/news';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const newsItem = await getNewsBySlug(slug);

    if (!newsItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(newsItem);
}
