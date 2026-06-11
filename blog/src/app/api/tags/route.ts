import { getAllTags } from '@/lib/blog-taxonomy';
import { TAXONOMY_CACHE_HEADERS } from '@/lib/api-cache';
import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
  const data = await getAllTags();
  return NextResponse.json({ data }, { headers: TAXONOMY_CACHE_HEADERS });
}
