import { NextResponse } from 'next/server';
import { getNewsList } from '@/services/server/news';

export async function GET() {
    const news = await getNewsList();
    return NextResponse.json(news);
}
