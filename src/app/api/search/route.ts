import { NextRequest, NextResponse } from 'next/server';
import { performGlobalSearch } from '@/lib/search/service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ query: q, results: [] });
  }

  try {
    const results = await performGlobalSearch(q);
    return NextResponse.json({ query: q, results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
