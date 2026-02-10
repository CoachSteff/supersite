import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';
import { getUserById } from '@/lib/users';

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

    const currentUser = getUserById(sessionCookie.value);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { userIds, type, title, message, link, metadata } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      );
    }

    const validTypes = ['system', 'interaction', 'content', 'admin', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    let created = 0;

    for (const userId of userIds) {
      try {
        createNotification(userId, {
          type,
          title,
          message,
          link,
          metadata,
        });
        created++;
      } catch (error) {
        console.error(`[API] Failed to create notification for user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      created,
    });
  } catch (error) {
    console.error('[API] Error creating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create notifications' },
      { status: 500 }
    );
  }
}
