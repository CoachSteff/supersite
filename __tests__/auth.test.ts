/**
 * Tests for lib/auth.ts
 * Covers OTP generation, JWT, and rate limiting
 */

// Mock filesystem before importing auth module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  mkdirSync: jest.fn(),
}));

jest.mock('js-yaml', () => ({
  dump: jest.fn((data: any) => JSON.stringify(data)),
  load: jest.fn((str: string) => JSON.parse(str)),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockImplementation((token: string) => {
    if (token === 'valid-token') {
      return { userId: 'user-1', email: 'test@example.com', username: 'testuser' };
    }
    throw new Error('Invalid token');
  }),
}));

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('generates a 6-digit string', async () => {
      const { generateOTP } = await import('@/lib/auth');
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('generates different codes on successive calls', async () => {
      const { generateOTP } = await import('@/lib/auth');
      const codes = new Set(Array.from({ length: 10 }, () => generateOTP()));
      // With crypto.randomInt, we should get varied results
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe('hashEmail', () => {
    it('produces consistent hashes for the same email', async () => {
      const { hashEmail } = await import('@/lib/auth');
      const hash1 = hashEmail('test@example.com');
      const hash2 = hashEmail('test@example.com');
      expect(hash1).toBe(hash2);
    });

    it('normalizes email casing and whitespace', async () => {
      const { hashEmail } = await import('@/lib/auth');
      const hash1 = hashEmail('Test@Example.com');
      const hash2 = hashEmail('  test@example.com  ');
      expect(hash1).toBe(hash2);
    });

    it('produces a hex string', async () => {
      const { hashEmail } = await import('@/lib/auth');
      const hash = hashEmail('test@example.com');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('generateJWT', () => {
    it('calls jwt.sign with correct payload', async () => {
      const jwt = require('jsonwebtoken');
      const { generateJWT } = await import('@/lib/auth');
      const token = generateJWT('user-1', 'test@example.com', 'testuser');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user-1', email: 'test@example.com', username: 'testuser' },
        expect.any(String),
        { expiresIn: '30d' }
      );
      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('verifyJWT', () => {
    it('returns payload for valid tokens', async () => {
      const { verifyJWT } = await import('@/lib/auth');
      const result = verifyJWT('valid-token');
      expect(result).toEqual({
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      });
    });

    it('returns null for invalid tokens', async () => {
      const { verifyJWT } = await import('@/lib/auth');
      const result = verifyJWT('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('checkRateLimit', () => {
    it('allows requests within the limit', async () => {
      const { checkRateLimit } = await import('@/lib/auth');
      const id = `test-${Date.now()}`;
      expect(checkRateLimit(id, 3, 60)).toBe(true);
      expect(checkRateLimit(id, 3, 60)).toBe(true);
      expect(checkRateLimit(id, 3, 60)).toBe(true);
    });

    it('blocks requests exceeding the limit', async () => {
      const { checkRateLimit } = await import('@/lib/auth');
      const id = `test-block-${Date.now()}`;
      checkRateLimit(id, 2, 60);
      checkRateLimit(id, 2, 60);
      expect(checkRateLimit(id, 2, 60)).toBe(false);
    });
  });
});
