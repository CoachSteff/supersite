import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { markAsRead, markAllAsRead } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value;
    const body = await request.json();

    let markedCount = 0;

    if (body.all === true) {
      markedCount = markAllAsRead(userId);
    } else if (Array.isArray(body.notificationIds)) {
      markedCount = markAsRead(userId, body.notificationIds);
    } else {
      return NextResponse.json(
        { error: 'Invalid request body. Provide "notificationIds" array or "all": true' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      markedCount,
    });
  } catch (error) {
    console.error('[API] Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
