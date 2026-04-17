# Production Deployment Checklist

Pre-deployment sanity pass for a SuperSite instance. Work top to bottom; every box should be checked before the first real user hits the site.

## Environment variables

- [ ] **`JWT_SECRET` set** — required in all environments. Minimum 32 characters. Generate with `openssl rand -base64 48`. **Missing or short secrets crash the server at boot.**
- [ ] **`NODE_ENV=production`** — enables `Strict-Transport-Security`, tightens CSP (no `'unsafe-eval'`), and flips auth cookies to `secure`.
- [ ] **`TRUSTED_PROXY=true`** — set this **only** if you deploy behind a reverse proxy you control (Caddy, Nginx, Cloudflare). Without it, `X-Forwarded-For` is ignored and client IP comes from the direct connection.
- [ ] **SMTP credentials** — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` if using email OTP in production (otherwise OTPs are logged to the console — dev only).
- [ ] **AI provider key** — e.g. `ANTHROPIC_API_KEY`. Only needed if `chat.enabled: true` in config.
- [ ] **`.env.local` / production env is excluded from your image and logs.**

## Security headers (shipped by default)

Verify with `curl -I https://yourdomain/`:

- [ ] `Content-Security-Policy` present
- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` present

If you embed third-party scripts/iframes, extend `next.config.js` → `csp` before deploying. Ship CSP in report-only mode first if your site is complex.

## HTTPS & cookies

- [ ] **HTTPS enforced at the proxy/CDN.** Auth cookies have `secure: true` in production and will not be sent over HTTP.
- [ ] **Auth cookie domain/path check** — after login in production, confirm the `auth-token` cookie is scoped correctly in devtools.
- [ ] **Logout flow verified** — the cookie is actually evicted (not just cleared in React state).

## Authentication

- [ ] OTP email delivery tested end-to-end in the production environment.
- [ ] OTP expiry works (15 min default; delete expired codes with the cron/cleanup helper if you schedule one).
- [ ] Rate limits validated:
  - Per-email: 10 attempts / 15 minutes on `/api/auth/verify-otp`
  - Per-IP: 30 attempts / 15 minutes (secondary, since email is primary)
- [ ] Confirm the server actually sees distinct client IPs. Without `TRUSTED_PROXY=true` behind a proxy, every request looks like it comes from the proxy IP and the per-IP limit becomes global.

## CSRF

- [ ] State-changing API calls from your browser (profile update, favourites, logout) work from the site itself.
- [ ] The same calls from `curl` with `Origin: https://evil.com` return `403 Cross-origin request blocked`.
- [ ] If you integrate a non-browser client (mobile app, server-to-server), it sets an explicit `Origin` header matching your domain — or you've allowlisted the specific route in `middleware.ts`.

## Request limits

- [ ] `Content-Length` caps verified:
  - `/api/*` state-changing methods → 1 MB
  - `/api/chat/stream` → 256 KB

A quick test:
```bash
dd if=/dev/zero bs=1M count=2 | curl -X POST -d @- -H 'Content-Type: application/octet-stream' https://yourdomain/api/contact
# expect: 413
```

## Data persistence

- [ ] `data/` directory is writable by the Node process.
- [ ] `data/` is in `.gitignore` (it is by default).
- [ ] **Automated backups** configured for `data/users/` and `data/otps/`. This is the only source of truth for user accounts.
- [ ] `contact-submissions.log` is either rotated or shipped to a log aggregator — it appends forever.

## Content & build

- [ ] `npm run build` succeeds with zero type errors.
- [ ] `STRICT_CONTENT=true npm run build` succeeds — no unparseable markdown in `content-custom/`.
- [ ] `npm run test:ci` passes.
- [ ] (Optional) `npm run test:e2e` passes against a local build.

## Rate limiting at scale

**In-memory rate limiting is shipped by default.** It resets on server restart and does **not** share state across replicas. For a single-VPS deploy with PM2 or similar, this is fine. If you run multiple instances, migrate to a shared store:

1. **Redis (recommended)**
   - Install `ioredis`
   - Replace `rateLimitMap` in `lib/auth.ts` with `await redis.incr(\`ratelimit:\${key}\`)` with a TTL
2. **Upstash Rate Limiting** — managed Redis, good for serverless
3. **Cloudflare Rate Limiting** — at the edge, doesn't need app code changes

Do this **before** scaling beyond a single instance. Otherwise each replica has its own empty bucket and an attacker can pick a replica at random to reset.

## Observability

- [ ] Server logs captured by your hosting platform (Vercel, PM2 + journald, Docker logs, etc.).
- [ ] `[markdown]` lines in build output scanned — any parse failure there means a page silently missing.
- [ ] Consider shipping Next.js `request` logs to a central aggregator.

## Post-deploy smoke tests

After the first deploy, run these from a fresh terminal:

```bash
# 1. Home loads, CSP header present
curl -sI https://yourdomain/ | grep -iE 'content-security-policy|strict-transport-security'

# 2. Auth is locked down
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST https://yourdomain/api/notifications/create
# expect: 401

# 3. CSRF works
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST -H 'Origin: https://evil.com' \
  -H 'Content-Type: application/json' \
  -d '{}' https://yourdomain/api/contact
# expect: 403

# 4. Scheme allowlist (requires a logged-in cookie):
curl -s -o /dev/null -w '%{http_code}\n' \
  -X PATCH -b 'auth-token=<real-jwt>' \
  -H 'Content-Type: application/json' \
  -d '{"social":{"x":"javascript:alert(1)"}}' \
  https://yourdomain/api/user/profile
# expect: 400
```

If any of these return unexpected codes, roll back and investigate before sending real traffic.
