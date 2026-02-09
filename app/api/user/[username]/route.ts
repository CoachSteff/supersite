import { NextRequest, NextResponse } from 'next/server';
import { getPublicProfile } from '@/lib/users';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const publicProfile = getPublicProfile(username);

    if (!publicProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: publicProfile,
    });
  } catch (error) {
    console.error('[User] Get public profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
