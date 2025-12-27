import { NextResponse } from 'next/server';
import { getFolderStructure } from '@/lib/markdown';

export async function GET() {
  try {
    const items = getFolderStructure();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Navigation error:', error);
    return NextResponse.json({ items: [] });
  }
}
