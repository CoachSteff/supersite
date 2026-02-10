import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserNotifications, getUnreadCount } from '@/lib/notifications';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const { notifications, total } = getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
    });

    const unreadCount = getUnreadCount(userId);

    return NextResponse.json({
      notifications,
      unreadCount,
      total,
    });
  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
