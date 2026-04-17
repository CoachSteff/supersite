import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOTP, generateJWT, setAuthCookie, checkRateLimit } from '@/lib/auth';
import { getUserByEmail, createUser, updateLastLogin } from '@/lib/users';
import { sendWelcomeEmail } from '@/lib/email';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

// Only honor forwarded headers when explicitly behind a trusted reverse proxy.
// Otherwise a client can spoof them to evade rate limiting.
function getClientIp(request: NextRequest): string {
  const trustProxy = process.env.TRUSTED_PROXY === 'true';
  if (trustProxy) {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return forwarded;
    const real = request.headers.get('x-real-ip');
    if (real) return real;
  }
  return request.ip || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // First-line rate-limit: per-IP (cheap, prevents body-parse spam).
    // When not behind a trusted proxy, this keys on a shared "unknown" bucket — that's intentional.
    const ip = getClientIp(request);
    if (!checkRateLimit(`ip:${ip}`, 30, 15)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code } = requestSchema.parse(body);

    // Stronger rate-limit keyed by email — can't be evaded by rotating IPs.
    if (!checkRateLimit(`otp:${email.toLowerCase()}`, 10, 15)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

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
