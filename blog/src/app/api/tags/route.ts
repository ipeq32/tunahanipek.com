import { getAllTags } from '@/lib/blog-taxonomy';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getAllTags();
  return NextResponse.json({ data });
}
