import { NextResponse } from 'next/server';
import { getBlogList } from '@/services/server/blog';

export async function GET() {
    const list = await getBlogList();
    return NextResponse.json(list);
}
