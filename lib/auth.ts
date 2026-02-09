import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import yaml from 'js-yaml';
import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile } from './users';

// Ensure data directories exist
const DATA_DIR = join(process.cwd(), 'data');
const OTPS_DIR = join(DATA_DIR, 'otps');
const USERS_DIR = join(DATA_DIR, 'users');

[DATA_DIR, OTPS_DIR, USERS_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const OTP_EXPIRY_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 3;
const JWT_EXPIRY_DAYS = 30;

export interface OTPData {
  email: string;
  code: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Generate a 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash email for filename (SHA-256)
export function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

// Store OTP in YAML file
export function storeOTP(email: string, code: string): void {
  const emailHash = hashEmail(email);
  const otpPath = join(process.cwd(), 'data', 'otps', `${emailHash}.yaml`);
  
  const otpData: OTPData = {
    email: email.toLowerCase().trim(),
    code,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString(),
    attempts: 0,
    createdAt: new Date().toISOString(),
  };

  const yamlContent = yaml.dump(otpData);
  writeFileSync(otpPath, yamlContent, 'utf-8');
}

// Validate OTP
export function validateOTP(email: string, code: string): { valid: boolean; error?: string } {
  const emailHash = hashEmail(email);
  const otpPath = join(process.cwd(), 'data', 'otps', `${emailHash}.yaml`);

  if (!existsSync(otpPath)) {
    return { valid: false, error: 'No OTP found for this email' };
  }

  try {
    const fileContent = readFileSync(otpPath, 'utf-8');
    const otpData = yaml.load(fileContent) as OTPData;

    // Check if expired (use millisecond timestamps for precision)
    const expiresAtMs = new Date(otpData.expiresAt).getTime();
    const nowMs = Date.now();

    if (nowMs >= expiresAtMs) {
      unlinkSync(otpPath);
      return { valid: false, error: 'OTP has expired' };
    }

    // Check max attempts
    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      unlinkSync(otpPath);
      return { valid: false, error: 'Maximum attempts exceeded' };
    }

    // Check if code matches
    if (otpData.code !== code) {
      // Increment attempts
      otpData.attempts += 1;
      writeFileSync(otpPath, yaml.dump(otpData), 'utf-8');
      return { valid: false, error: `Invalid code. ${MAX_OTP_ATTEMPTS - otpData.attempts} attempts remaining` };
    }

    // Valid! Delete the OTP file
    unlinkSync(otpPath);
    return { valid: true };
  } catch (error) {
    console.error('[Auth] Error validating OTP:', error);
    return { valid: false, error: 'Failed to validate OTP' };
  }
}

// Clean up expired OTP files
export function cleanupExpiredOTPs(): void {
  const otpsDir = join(process.cwd(), 'data', 'otps');
  
  if (!existsSync(otpsDir)) {
    return;
  }

  try {
    const files = readdirSync(otpsDir);

    files.forEach((file) => {
      if (!file.endsWith('.yaml')) return;

      const filePath = join(otpsDir, file);
      try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const otpData = yaml.load(fileContent) as OTPData;

        // Use millisecond comparison
        const expiresAtMs = new Date(otpData.expiresAt).getTime();
        if (Date.now() >= expiresAtMs) {
          unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`[Auth] Error cleaning up OTP file ${file}:`, err);
      }
    });
  } catch (error) {
    console.error('[Auth] Error cleaning up expired OTPs:', error);
  }
}

// Generate JWT token
export function generateJWT(userId: string, email: string, username: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${JWT_EXPIRY_DAYS}d`,
  });
}

// Verify JWT token
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('[Auth] JWT verification failed:', error);
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_EXPIRY_DAYS * 24 * 60 * 60, // seconds
    path: '/',
  });
  return response;
}

// Clear auth cookie
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('auth-token');
  return response;
}

// Get user from request
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

// Rate limiting helper (simple in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(email: string, maxRequests: number = 5, windowMinutes: number = 60): boolean {
  const key = hashEmail(email);
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMinutes * 60 * 1000,
    });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count += 1;
  return true;
}
