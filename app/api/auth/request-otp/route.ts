import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, storeOTP, checkRateLimit, cleanupExpiredOTPs } from '@/lib/auth';
import { sendOTP } from '@/lib/email';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    // Clean up expired OTPs periodically
    cleanupExpiredOTPs();

    // Check rate limit (5 requests per hour)
    if (!checkRateLimit(email, 5, 60)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate and store OTP
    const code = generateOTP();
    storeOTP(email, code);

    // Send email
    const emailSent = await sendOTP(email, code);

    if (!emailSent) {
      console.error('[Auth] Failed to send OTP email');
      // In development, still return success even if email fails
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Verification code sent to your email (check console in dev mode)',
        });
      }
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('[Auth] Request OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
