# Upgrading SuperSite

Per-release migration notes. Newest release first.

- [0.4.0 — April 17, 2026](#upgrading-to-040)
- [0.2.0 — February 10, 2026](#upgrading-to-020)

---

## Upgrading to 0.4.0

0.4.0 is a security & correctness release. One breaking change: `JWT_SECRET` is now required in every environment. No other config or code change is forced; everything else is additive or internal.

### Breaking: `JWT_SECRET` required everywhere

Earlier releases silently fell back to the literal string `'dev-secret-change-in-production'` when `NODE_ENV=development` and `JWT_SECRET` was unset. That fallback has been removed. Missing or short secrets now throw at boot.

**Action required:**

```bash
# 1. Generate a secret
openssl rand -base64 48

# 2. Add it to .env.local (development) and your production env store
#    Must be at least 32 characters.
JWT_SECRET=<paste>
```

**Rotation caveat:** changing `JWT_SECRET` invalidates every outstanding session. Users will be logged out.

### New optional environment variables

| Variable | Default | When to set |
|---|---|---|
| `TRUSTED_PROXY` | unset (false) | Set to `true` **only** when the app runs behind a reverse proxy you control (Caddy, Nginx, Cloudflare). When unset, `X-Forwarded-For` and `X-Real-IP` headers are ignored — client IP is taken from `request.ip`. |
| `STRICT_CONTENT` | unset (false) | Set to `true` in CI to fail the build when any markdown file fails to parse. By default, unparseable files are logged and skipped. |

### Security headers now shipped

`next.config.js` now emits `Content-Security-Policy`, `Strict-Transport-Security` (production only), plus the previously-present `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.

**If you customized `next.config.js` headers, re-apply your changes on top of the new baseline.** See [SECURITY.md](../SECURITY.md) for the full policy. If you embed third-party scripts, iframes, or fonts, extend `script-src`/`frame-src`/`font-src` accordingly.

### CSRF middleware now runs on `/api/*`

The `middleware.ts` matcher used to exclude `/api/*`. It no longer does, so the new `Origin`/`Referer` check can fire on state-changing API calls. The existing language-rewrite logic still short-circuits for API paths, so no behavior change there.

**If you fetch your own API from a non-browser client** (curl, a mobile app, server-to-server), set an explicit `Origin` header matching the site host, or disable the CSRF block in `middleware.ts` for that specific route.

### Minor API response changes

- `/api/chat/stream` now returns `400` / `413` as regular HTTP responses for invalid or oversized bodies. Previously it returned `200` with an `error` event in the stream. Clients that only checked the stream for error events should also check `response.ok`.
- `/api/notifications/create` now requires a valid JWT and can only create notifications for the caller's own `userId` (pending a proper role system). Calls that tried to create notifications for other users now return `403 Forbidden`.
- `/api/contact` returns `400` with a specific field error for over-long fields (name ≤ 200, message ≤ 5000 chars).

### Test-suite env update

If you run Jest in a custom environment, set `JWT_SECRET` in your test setup. The shipped `jest.setup.ts` sets a 64-character test secret automatically.

### Migration steps

```bash
# 1. Pull, install, build
git pull origin main
npm install

# 2. Set JWT_SECRET in .env.local and in your production env
openssl rand -base64 48   # generate
# paste into .env.local as JWT_SECRET=...

# 3. Re-check any custom next.config.js / middleware.ts overrides

# 4. Test
npm run test:ci
npm run build
```

### Rollback

```bash
git checkout v0.3.0
npm install
```

The old `dev-secret-change-in-production` fallback returns automatically on 0.3.x — but do not deploy 0.3.x with a missing production secret.

---

## Upgrading to 0.2.0

This guide helps you upgrade from version 0.1.x to 0.2.0.

## Breaking Changes

### 1. Chat Component Renames

The enhanced chat components have been promoted to the main components:

**Before (0.1.x):**
```typescript
import ChatProvider from '@/components/ChatProviderEnhanced';
import ChatWindow from '@/components/ChatWindowEnhanced';
```

**After (0.2.0):**
```typescript
import ChatProvider from '@/components/ChatProvider';
import ChatWindow from '@/components/ChatWindow';
```

**Action Required:**
- If you have custom code importing chat components, update the import paths
- Remove any references to legacy `ChatProvider.tsx` or `ChatWindow.tsx`
- The legacy components have been removed from the codebase

### 2. Theme System Changes

The single-file theme system has been replaced with folder-based themes.

**Before (0.1.x):**
- Themes were single YAML files: `themes/default.yaml`, `themes/modern.yaml`
- Theme structure was flat

**After (0.2.0):**
- Themes are in folders: `themes/base/`, `themes/blog/`, `themes/business/`
- Each theme has `colors.yaml` and `structure.yaml`
- More granular control over theming

**Action Required:**
- If you created custom themes in 0.1.x format, migrate to folder structure
- See `themes/base/` for reference structure
- Update `branding.theme` in your config to use new theme names

**Migration Example:**
```yaml
# Old (0.1.x)
branding:
  theme: modern

# New (0.2.0)
branding:
  theme: business  # or base, blog, chatbot, community, influencer
```

### 3. Theme Loader Function

The `getActiveTheme()` function now returns `FullTheme` directly.

**Before (0.1.x):**
```typescript
const theme = getActiveTheme();        // Returns legacy Theme type
const fullTheme = getActiveFullTheme(); // Returns FullTheme
```

**After (0.2.0):**
```typescript
const theme = getActiveTheme();  // Now returns FullTheme directly
```

**Action Required:**
- If you have custom code calling `getActiveFullTheme()`, use `getActiveTheme()` instead
- Update type annotations from `Theme` to `FullTheme` if needed

## New Features

### 1. Internationalization

Version 0.2.0 adds comprehensive multi-language support.

**New Configuration:**
```yaml
multilingual:
  enabled: true
  supportedLanguages: [en, nl, fr, de, es, it, pt]
  defaultLanguage: en
  useAiTranslation: true
  caching:
    enabled: true
    directory: .cache/translations

features:
  languageSwitcher: true
```

**New Files:**
- `middleware.ts` - Language routing (required for multi-language)
- `lib/language-detector.ts` - Language detection utilities
- `lib/translation-service.ts` - AI translation with caching

**Action Required:**
- Add `middleware.ts` to your project if missing
- Configure supported languages in your `site.local.yaml`
- Enable `features.languageSwitcher` to show language selector

### 2. Favourites/Bookmarking System

Users can now bookmark pages and blog posts.

**New Configuration:**
```yaml
features:
  favorites: true
```

**New Files:**
- `app/favourites/page.tsx` - Favourites management page
- `app/api/favorites/route.ts` - Favourites API
- `components/FavouritesList.tsx` - Favourites UI component

**Action Required:**
- Enable `features.favorites` in your config to activate the feature
- The `/favourites` route is automatically available when enabled

### 3. Loading States

Improved loading indicators for better UX.

**New Files:**
- `app/loading.tsx` - Global loading component
- `app/blog/loading.tsx` - Blog-specific loading

**Action Required:**
- No action needed, loading states work automatically

## Configuration Changes

### New Schema Fields

The configuration schema has been extended:

```yaml
features:
  favorites: true          # NEW: Enable bookmarking
  languageSwitcher: true   # NEW: Show language selector

multilingual:              # NEW: Entire section
  enabled: true
  supportedLanguages: [en, nl, fr]
  defaultLanguage: en
  useAiTranslation: true
  caching:
    enabled: true
    directory: .cache/translations
```

**Action Required:**
- Review new configuration options
- Add desired features to your `site.local.yaml`
- All new features are optional and backward compatible

## Dependencies

### New Dependencies

Version 0.2.0 does not add new npm dependencies. All existing dependencies from 0.1.x are sufficient.

**Verify Your Dependencies:**
```bash
npm install
```

All translation and language detection is handled by existing libraries (`gray-matter`, `remark`, `remark-html`) and AI providers.

## Migration Steps

### Step 1: Backup Your Customizations

```bash
# Backup your local config
cp config/site.local.yaml config/site.local.yaml.backup

# Backup custom content
cp -r content-custom content-custom.backup

# Backup custom themes (if any)
cp -r themes-custom themes-custom.backup
```

### Step 2: Update Code

```bash
# Pull latest changes
git pull origin main

# Install dependencies (verify no issues)
npm install
```

### Step 3: Update Imports (If Applicable)

If you have custom code importing chat components:

```bash
# Search for legacy imports
grep -r "ChatProviderEnhanced\|ChatWindowEnhanced" .
```

Update any matches to use the new names.

### Step 4: Migrate Custom Themes (If Applicable)

If you created custom themes in 0.1.x:

1. Create folder structure: `themes-custom/mytheme/`
2. Split theme into `colors.yaml` and `structure.yaml`
3. See `themes/base/` for reference
4. Update config to point to new theme

### Step 5: Test Your Site

```bash
# Start development server
npm run dev

# Test critical flows:
# - Homepage loads
# - Chat works
# - Navigation works
# - Blog works
# - Your custom features work
```

### Step 6: Enable New Features (Optional)

Update your `config/site.local.yaml`:

```yaml
# Enable internationalization
multilingual:
  enabled: true
  supportedLanguages: [en, nl, fr]

# Enable bookmarking
features:
  favorites: true
  languageSwitcher: true
```

Test each feature as you enable it.

## Rollback Plan

If you encounter issues:

### Option 1: Restore Backups

```bash
# Restore config
cp config/site.local.yaml.backup config/site.local.yaml

# Restore content
rm -rf content-custom
cp -r content-custom.backup content-custom
```

### Option 2: Revert to 0.1.x

```bash
# Check out previous version
git checkout v0.1.0-alpha.2

# Reinstall dependencies
npm install
```

## Getting Help

If you encounter issues during upgrade:

1. Check [CONFIGURATION.md](./CONFIGURATION.md) for configuration reference
2. Review [CHANGELOG.md](../CHANGELOG.md) for complete list of changes
3. Open an issue on [GitHub](https://github.com/coachsteff/supersite/issues)

## Summary

**Required Actions:**
- ✅ Update chat component imports (if you have custom code)
- ✅ Migrate custom themes to folder structure (if applicable)
- ✅ Add `middleware.ts` for internationalization (if enabling)

**Optional Enhancements:**
- Enable internationalization for multi-language support
- Enable favourites for bookmarking functionality
- Explore new theme options

**Backward Compatibility:**
- All 0.1.x configurations continue working
- New features are opt-in
- No forced breaking changes for basic usage

Welcome to SuperSite 0.2.0! 🎉
