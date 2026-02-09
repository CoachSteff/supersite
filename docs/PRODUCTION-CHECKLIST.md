# Production Deployment Checklist

## Critical Items

### 1. Rate Limiting
⚠️ **Current Limitation:** In-memory rate limiting does not scale

**Issue:**
- Resets on server restart
- Doesn't work across load-balanced instances
- Won't persist in serverless environments

**Fix Options:**
1. **Redis** (recommended)
   - Install `ioredis`
   - Replace `rateLimitMap` with Redis hash
   - Example: `await redis.incr(\`ratelimit:\${email}\`)`

2. **File-based**
   - Similar to OTP storage
   - Write rate limit counters to `data/ratelimits/`

3. **External service**
   - Upstash Rate Limiting
   - Cloudflare Rate Limiting

### 2. Environment Variables
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Configure SMTP credentials
- [ ] Set NODE_ENV=production

### 3. Data Directory
- [ ] Ensure `data/` directory is writable
- [ ] Confirm `data/` is in .gitignore
- [ ] Set up automated backups for user data

### 4. Security
- [ ] Enable HTTPS (cookies require secure flag)
- [ ] Set up CSRF protection
- [ ] Configure CORS properly
- [ ] Add rate limiting at infrastructure level (Cloudflare, nginx)

## Testing
- [ ] Test OTP flow end-to-end
- [ ] Verify cookie persistence in production domain
- [ ] Test rate limiting behavior
- [ ] Verify email delivery

## Authentication System Fixes Applied

The following critical fixes have been implemented:

1. ✅ **Directory Initialization** - Auto-creates `data/otps/` and `data/users/` directories
2. ✅ **OTP Expiry Precision** - Uses millisecond timestamps for accurate expiry checks
3. ✅ **JWT Refresh on Username Change** - Re-issues JWT token when username is updated
4. ✅ **Validation Error Handling** - Safe array access prevents crashes on validation errors
5. ✅ **Cookie Persistence** - Authentication cookies work correctly across requests
6. ✅ **Privacy Settings** - Returns 200 with minimal profile data when profile is hidden
7. ✅ **Data Directory in .gitignore** - User data excluded from version control

## Known Limitations

### Rate Limiting (See Item #1 above)
The current in-memory rate limiting implementation is suitable for development and single-instance deployments but **must be upgraded** for production environments with:
- Multiple server instances
- Load balancing
- Serverless deployment (AWS Lambda, Vercel Functions)

Plan to implement persistent rate limiting before scaling beyond a single server instance.
