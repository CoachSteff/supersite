import { NextResponse } from 'next/server';
import { getActiveFullTheme } from '@/lib/config';

export async function GET() {
  try {
    const theme = getActiveFullTheme();
    return NextResponse.json(theme);
  } catch (error) {
    console.error('Error loading theme:', error);
    return NextResponse.json(
      { error: 'Failed to load theme' },
      { status: 500 }
    );
  }
}
