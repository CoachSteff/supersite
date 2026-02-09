import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUserById } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    const jwtPayload = getUserFromRequest(request);

    if (!jwtPayload) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Load full user profile
    const user = getUserById(jwtPayload.userId);

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Return full profile (user is authenticated)
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
