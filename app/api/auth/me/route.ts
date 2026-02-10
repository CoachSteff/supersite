import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUserById, autoMigrateUser } from '@/lib/users';

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
    let user = getUserById(jwtPayload.userId);

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Auto-migrate user data if needed
    user = autoMigrateUser(user);

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
