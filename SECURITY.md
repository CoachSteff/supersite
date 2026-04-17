# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :warning: security fixes only |
| 0.1.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in SuperSite, please follow these steps:

1. **Do NOT** open a public issue.
2. **Email** the maintainers (details in `package.json` or the GitHub profile).
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Posture (0.4.0)

Release 0.4.0 tightened several defaults. The notes below describe what ships out of the box.

### Shipped HTTP Headers

Set by `next.config.js` and applied to every route:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (production only) |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(self), geolocation=()` |

**Customizing CSP:** the policy intentionally avoids `script-src 'unsafe-eval'` in production and blocks all framing. If you embed third-party widgets, add their origins to `script-src`/`connect-src`/`img-src` in `next.config.js`. Consider moving to nonce-based `script-src` if you can tolerate the build complexity.

### Authentication (`lib/auth.ts`)

- **`JWT_SECRET` is required.** Missing or shorter-than-32-character secrets throw at boot. No dev fallback exists.
- **OTP comparison is constant-time** via `crypto.timingSafeEqual`. The old `!==` comparison leaked per-digit timing over multi-request brute force.
- **OTP expiry** uses millisecond timestamps; expired codes are deleted on read.
- **Rate limiting** is in-memory. Primary key on `/api/auth/verify-otp` is the email address (can't be rotated around); secondary key is the client IP.
- **Client IP** comes from `request.ip` by default. `X-Forwarded-For` and `X-Real-IP` are only read when `TRUSTED_PROXY=true` is set — otherwise they're considered spoofable.
- **Auth cookies** are `httpOnly`, `secure` in production, `SameSite=Lax`. `clearAuthCookie` overwrites with matching attributes so browsers actually evict the cookie.

### CSRF Protection

Every state-changing request (`POST`/`PUT`/`PATCH`/`DELETE`) to `/api/*` must have an `Origin` or `Referer` header whose host matches the request's own host. Requests with no Origin/Referer or a mismatched one return `403 Cross-origin request blocked`. Enforced in `middleware.ts`.

This runs in addition to the `SameSite=Lax` cookie. Together they defeat standard CSRF without a token.

### Request Body Limits

- **Global API cap:** 1 MB on `/api/*` unsafe methods, enforced in `middleware.ts` via `Content-Length`.
- **Chat stream cap:** 256 KB on `/api/chat/stream`.

Requests over the limit return `413 Request body too large`.

### Input Validation

- **User profile** (`app/api/user/profile/route.ts`): social/link URLs pass a Zod `safeUrl` refine that rejects `javascript:`, `data:`, `vbscript:`, and all non-http(s) schemes.
- **Contact form** (`app/api/contact/route.ts`): Zod-validated with length caps (name ≤ 200, email RFC, message ≤ 5000). Logs written as JSON lines so CRLF in the body can't forge separate log entries.

### Content Security

- Markdown HTML output passes through `remark-html` with `sanitize: true`.
- Hashtag extraction avoids headings, code blocks, inline code, and existing links.
- Content loader logs and skips unparseable files; set `STRICT_CONTENT=true` in CI to fail the build instead.

### AI Chat Security

- AI provider calls happen server-side only; API keys are never shipped to the client.
- Streaming responses validate and parse the request body before opening the SSE stream (`400`/`413` are returned as normal HTTP responses, not embedded in an event stream).
- Context includes only public site content.
- Provider terms of service apply to anything submitted to the chat.

## Security Best Practices

When deploying SuperSite:

1. **Never commit `.env` or `.env.local`** — they contain `JWT_SECRET` and API keys.
2. **Generate a strong `JWT_SECRET`:** `openssl rand -base64 48`. Rotate periodically; rotating invalidates all outstanding sessions.
3. **Set `TRUSTED_PROXY=true`** only when actually behind a reverse proxy you control. Otherwise attackers can spoof `X-Forwarded-For` to evade IP-based rate limiting.
4. **Run `npm audit`** regularly in CI.
5. **Enable HTTPS in production.** The `secure` cookie flag and HSTS both require it.
6. **Back up `data/`** — it holds user records and OTPs.

### Scaling Considerations

- **Rate limiting is in-memory.** It resets on restart and doesn't share state across replicas. If you run multiple instances, move to Redis or Upstash; see `docs/PRODUCTION-CHECKLIST.md`.
- **OTP storage is file-based** (`data/otps/`). Works for single-instance deploys; move to a shared store for horizontal scale.

## Questions?

For security-related questions that are not vulnerabilities, open a GitHub discussion.
