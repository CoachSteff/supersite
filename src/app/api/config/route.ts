import { NextResponse } from 'next/server';
import { getClientSafeConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = getClientSafeConfig();
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config API error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
