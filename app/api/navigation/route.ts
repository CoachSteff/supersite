import { NextResponse } from 'next/server';
import { getNavigationItems } from '@/lib/navigation';

export async function GET() {
  try {
    return NextResponse.json({ items: getNavigationItems() });
  } catch (error) {
    console.error('Navigation error:', error);
    return NextResponse.json({ items: [] });
  }
}
