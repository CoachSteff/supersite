import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { updateUser, getUserById } from '@/lib/users';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    newPosts: z.boolean().optional(),
    replies: z.boolean().optional(),
    mentions: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisible: z.boolean().optional(),
    emailVisible: z.boolean().optional(),
  }).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const jwtPayload = getUserFromRequest(request);

    if (!jwtPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const settingsUpdates = settingsSchema.parse(body);

    // Update user settings
    const updatedUser = updateUser(jwtPayload.userId, {
      settings: settingsUpdates as any,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedUser.settings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('[User] Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const jwtPayload = getUserFromRequest(request);

    if (!jwtPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = getUserById(jwtPayload.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      settings: user.settings,
    });
  } catch (error) {
    console.error('[User] Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}
