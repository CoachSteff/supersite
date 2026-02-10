import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';
import { hasSetCookiePreferences } from '@/lib/cookie-preferences';

const ANONYMOUS_USER_ID = 'anonymous';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    const userId = sessionCookie?.value || ANONYMOUS_USER_ID;

    const hasSet = hasSetCookiePreferences(userId !== ANONYMOUS_USER_ID ? userId : undefined);

    if (hasSet) {
      return NextResponse.json({ created: false, message: 'Preferences already set' });
    }

    const notification = createNotification(userId, {
      type: 'system',
      title: 'Cookie Preferences',
      message: 'SuperSite uses only essential session cookies. Click to review your cookie preferences.',
      metadata: {
        context: {
          type: 'cookie-preferences',
        },
      },
    });

    return NextResponse.json({ created: true, notification });
  } catch (error) {
    console.error('[API] Error creating cookie notification:', error);
    return NextResponse.json(
      { error: 'Failed to create cookie notification' },
      { status: 500 }
    );
  }
}
