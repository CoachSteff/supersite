import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, generateJWT, setAuthCookie } from '@/lib/auth';
import { updateUser, getUserById } from '@/lib/users';

const customSocialLinkSchema = z.object({
  name: z.string().min(1).max(50),
  url: z.string().url(),
});

const updateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Username must start with a letter and contain only letters, numbers, underscores, and hyphens').optional(),
  profile: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    jobTitle: z.string().max(200).optional(),
    organization: z.string().max(200).optional(),
    bio: z.string().max(2000).optional(),
    avatar: z.string().url().optional(),
  }).optional(),
  social: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    blog: z.string().url().optional().or(z.literal('')),
    custom: z.array(customSocialLinkSchema).optional(),
  }).optional(),
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
    const updates = updateSchema.parse(body);

    // Check if username is changing
    const isUsernameChange = updates.username && updates.username !== jwtPayload.username;

    // Update user
    const updatedUser = updateUser(jwtPayload.userId, updates);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Re-issue JWT if username changed
    const response = NextResponse.json({
      success: true,
      user: updatedUser,
    });

    if (isUsernameChange) {
      const newToken = generateJWT(updatedUser.id, updatedUser.email, updatedUser.username);
      setAuthCookie(response, newToken);
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Username already taken') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    console.error('[User] Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[User] Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
