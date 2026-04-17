# SuperSite v0.4.0 Release Notes

**Release Date:** April 17, 2026

## What's New

0.4.0 is a security and correctness release. Every finding from the April codebase audit has been addressed — across authentication, request handling, content safety, accessibility, and developer ergonomics. One breaking change: `JWT_SECRET` is now mandatory in every environment (minimum 32 characters).

No new features, no new content directives, no theme churn. If you're on 0.3.0, the upgrade surface is small: set `JWT_SECRET`, re-check any custom `next.config.js`/`middleware.ts`, and redeploy.

## Highlights

### Strict security headers out of the box

`next.config.js` now ships a real Content-Security-Policy plus HSTS (production only) on top of the previously-present `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. The default CSP blocks framing (`frame-ancestors 'none'`), inline `<object>`, and `script-src 'unsafe-eval'` in production.

### CSRF protection in middleware

`POST`/`PUT`/`PATCH`/`DELETE` requests to `/api/*` are rejected with 403 when the `Origin`/`Referer` host doesn't match the request host. Combined with `SameSite=Lax` auth cookies, this defeats cross-site forgeries without a token.

### Request body size caps

1 MB cap on all API mutations, 256 KB on `/api/chat/stream`. Enforced via `Content-Length`; oversized requests get 413 before any parsing.

### Authentication hardening

- OTP comparison is now **constant-time** (`crypto.timingSafeEqual`).
- `JWT_SECRET` is **required** in every environment — the old dev fallback is gone.
- `clearAuthCookie` overwrites with matching attributes so browsers actually evict the cookie on logout.
- Client IP comes from `request.ip` by default; `X-Forwarded-For` is only honored when `TRUSTED_PROXY=true`, eliminating a header-spoof evasion for IP-based rate limits.

### URL scheme allowlist

Profile social/link fields now reject `javascript:`, `data:`, `vbscript:`, and all non-http(s) schemes. Closes a stored-XSS vector for rendered profile links.

### Accessibility: skip-to-content link

WCAG 2.1 §2.4.1. A focus-visible "Skip to content" link is injected at the top of `<body>` and targets `#main-content`, which is now present on all four layouts.

### Developer ergonomics

- **Type-safe Lucide icon lookup** — `lib/lucide-icon.ts` replaces five `(LucideIcons as any)[name]` call sites.
- **Markdown content loader surfaces errors** — `getAllPages` / `getAllBlogPosts` log per-file parse failures and continue. Set `STRICT_CONTENT=true` in CI to fail the build.
- **`ThemeLoader` typed** against `FullTheme` instead of `as any`.
- **`ChatProvider` effect split** into mount-time fetch + config-driven history load, eliminating a stale-closure bug.

## Breaking Changes

### `JWT_SECRET` is now required in every environment

The development fallback (`'dev-secret-change-in-production'`) has been removed. Missing or shorter-than-32-character secrets throw at boot.

**Action required:** generate a secret and add it to `.env.local` and your production env:

```bash
openssl rand -base64 48
# paste into JWT_SECRET=...
```

Rotation note: changing `JWT_SECRET` invalidates all outstanding sessions.

### Middleware matcher now covers `/api/*`

Previously excluded. The matcher was widened so the new CSRF and body-size checks actually fire on API routes. The language-rewrite logic still short-circuits for API paths internally, so no user-visible behavior change — but if you had custom middleware logic keyed on the old exclusion, revisit it.

### `/api/chat/stream` returns proper HTTP status codes

Invalid or oversized bodies now get `400` / `413` before any SSE stream opens. Previously they returned `200` with an `error` event embedded in the stream. Clients that only checked for error events should also check `response.ok`.

## New Optional Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `TRUSTED_PROXY` | `false` | Set to `true` when behind a reverse proxy so `X-Forwarded-For` / `X-Real-IP` are honored for client-IP rate limiting. |
| `STRICT_CONTENT` | `false` | Set to `true` in CI to fail the build when any markdown file fails to parse. |

## Upgrade from 0.3.0

```bash
# 1. Pull + install
git pull origin main
npm install

# 2. Set JWT_SECRET in .env.local and your production env store
openssl rand -base64 48

# 3. Re-apply any custom next.config.js header overrides on the new baseline

# 4. Verify
npm run test:ci
npm run build
```

See [UPGRADING.md](../UPGRADING.md) for the full migration checklist and rollback instructions.

## Verification

After upgrading, confirm from a fresh terminal:

```bash
# Security headers present
curl -sI http://localhost:3001/ | grep -iE 'content-security-policy|x-frame-options'

# Auth route locked down
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3001/api/notifications/create
# expect: 401

# CSRF triggers
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Origin: http://evil.com' \
  -H 'Content-Type: application/json' -d '{}' http://localhost:3001/api/contact
# expect: 403
```

## Rollback

```bash
git checkout v0.3.0
npm install
```

## Thanks

0.4.0 was driven by an April codebase audit. No external contributors this release — but the audit itself is documented in the project's plan files if you want the full list of findings.
