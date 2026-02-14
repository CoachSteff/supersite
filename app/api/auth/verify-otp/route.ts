import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOTP, generateJWT, setAuthCookie, checkRateLimit } from '@/lib/auth';
import { getUserByEmail, createUser, updateLastLogin } from '@/lib/users';
import { sendWelcomeEmail } from '@/lib/email';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // IP-based rate limiting to prevent brute-force across multiple emails
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    if (!checkRateLimit(`ip:${ip}`, 10, 15)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

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

    // Create response with full user data (authenticated context)
    const response = NextResponse.json({
      success: true,
      user: user,
      isNewUser,
    });

    // Set auth cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Invalid input' },
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
