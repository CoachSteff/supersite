import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { markAllAsRead } from '@/lib/notifications';

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
    const markedCount = markAllAsRead(userId);

    return NextResponse.json({
      success: true,
      markedCount,
    });
  } catch (error) {
    console.error('[API] Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
