import { NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
        return NextResponse.json({ query: '', results: [] });
    }

    try {
        const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json({ query, results: [] }, { status: response.status });
        }
        const payload = await response.json();
        const data = payload?.data || payload;
        return NextResponse.json({ query, results: Array.isArray(data?.results) ? data.results : [] });
    } catch {
        return NextResponse.json({ query, results: [] }, { status: 500 });
    }
}
