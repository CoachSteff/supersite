import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOTP, generateJWT, setAuthCookie } from '@/lib/auth';
import { getUserByEmail, createUser, updateLastLogin, getPublicProfile } from '@/lib/users';
import { sendWelcomeEmail } from '@/lib/email';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = requestSchema.parse(body);

    // Validate OTP
    const validation = validateOTP(email, code);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid code' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = getUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = createUser(email);
      isNewUser = true;

      // Send welcome email (async, don't wait)
      sendWelcomeEmail(email, user.username).catch((err) => {
        console.error('[Auth] Failed to send welcome email:', err);
      });
    } else {
      // Update last login
      updateLastLogin(user.id);
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.email, user.username);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: getPublicProfile(user),
      isNewUser,
    });

    // Set auth cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('[Auth] Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
