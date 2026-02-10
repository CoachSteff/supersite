import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCookiePreferences, saveCookiePreferencesForUser } from '@/lib/cookie-preferences';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    const userId = sessionCookie?.value;

    const preferences = getCookiePreferences(userId);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('[API] Error fetching cookie preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cookie preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    const userId = sessionCookie?.value;

    const body = await request.json();
    const { analytics, marketing } = body;

    if (typeof analytics !== 'boolean' || typeof marketing !== 'boolean') {
      return NextResponse.json(
        { error: 'analytics and marketing must be boolean values' },
        { status: 400 }
      );
    }

    saveCookiePreferencesForUser(
      {
        necessary: true,
        analytics,
        marketing,
      },
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error saving cookie preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save cookie preferences' },
      { status: 500 }
    );
  }
}
