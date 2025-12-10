import { NextResponse } from 'next/server';

/**
 * Create a cached JSON response
 * @param data - Data to return
 * @param maxAge - Cache duration in seconds (default: 5 minutes)
 */
export function cachedResponse(data: any, maxAge: number = 300) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}
