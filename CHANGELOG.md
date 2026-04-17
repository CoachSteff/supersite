# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-17

A security and correctness release. Every issue surfaced by the April codebase audit has been addressed, covering authentication, request handling, content safety, accessibility, and developer ergonomics. One breaking change: `JWT_SECRET` is now required in all environments.

### ⚠️ Breaking Changes

- **`JWT_SECRET` environment variable is now required in all environments and must be at least 32 characters.** The development fallback (`dev-secret-change-in-production`) has been removed. See [UPGRADING.md](./docs/UPGRADING.md) for migration steps.

### Security

- **HSTS + Content-Security-Policy** headers shipped by default via `next.config.js`. CSP is restrictive (no `script-src *`, `frame-ancestors 'none'`, `object-src 'none'`); HSTS is gated to production with a 2-year max-age. `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` were already present.
- **CSRF protection via middleware** — `POST`/`PUT`/`PATCH`/`DELETE` requests to `/api/*` are rejected with 403 when the `Origin`/`Referer` host does not match the request host. Complements the existing `SameSite=Lax` auth cookie.
- **Request body size cap** — `/api/*` unsafe methods are rejected with 413 when `Content-Length` exceeds 1 MB. `/api/chat/stream` enforces a stricter 256 KB cap.
- **Constant-time OTP comparison** — `lib/auth.ts` now uses `crypto.timingSafeEqual` to validate OTP codes, eliminating a timing oracle over the 6-digit code space.
- **`clearAuthCookie` attribute match** — logout now overwrites the cookie with the same `path`/`httpOnly`/`secure`/`sameSite` attributes it was set with, ensuring browsers actually evict it.
- **Trusted-proxy gate for client IP** — `x-forwarded-for`/`x-real-ip` headers are only honored when `TRUSTED_PROXY=true`. Rate limiting now keys on `request.ip` by default, eliminating header-spoof evasion. OTP verification primary-keys on email, secondary-keys on IP.
- **URL scheme allowlist on user profiles** — `app/api/user/profile/route.ts` rejects `javascript:`, `data:`, `vbscript:`, and other non-http(s) schemes in social/link fields via Zod refine. Closes a stored-XSS vector for rendered profile links.
- **Removed JWT dev-secret fallback** — the hardcoded `'dev-secret-change-in-production'` default is gone. Missing `JWT_SECRET` throws at boot. Minimum 32-character length enforced.
- **Contact-form log-injection fix** — `app/api/contact/route.ts` now writes structured JSON lines instead of free-form text, and validates inputs with Zod (name ≤ 200, email RFC-valid, message ≤ 5000). CRLF in user input can no longer forge fake log entries.
- **Notifications API auth fix** — `app/api/notifications/create` no longer reads a nonexistent `session` cookie as a userId. Requires a valid JWT and restricts creation to the caller's own `userId` (no cross-user broadcast without an admin role, which does not yet exist).

### Fixed

- **Hydration mismatch on random hero image** — `RandomHeroImage` picked a different image on server vs client, producing a React hydration warning. Now initializes to the first image and swaps in a random pick post-mount.
- **Chat streaming route returned 200 + error-event on invalid bodies** — body parse and validation now happen before the stream opens, so malformed payloads produce proper `400`/`413` HTTP status codes.
- **Markdown content loader swallowed parse errors** — `getAllPages` and `getAllBlogPosts` now wrap each file in try/catch, log a clear `[markdown]` line with the path, and continue. Set `STRICT_CONTENT=true` in CI to fail the build when any file fails to parse.
- **`ChatProvider` effect used stale `config` closure** — split into separate mount-time fetch and config-driven history load, guarded by a `hasLoadedHistory` ref so session storage is read once after config settles.
- **`ThemeLoader` unsafely cast `theme as any`** — now typed against `FullTheme` with narrowed access to `theme.colors?.colors?.light/dark`.
- **Navigation active-state mismatch on trailing slashes** — `components/Navigation.tsx` normalizes both sides of the comparison.

### Added

- **Type-safe Lucide icon lookup** — `lib/lucide-icon.ts` exports `getLucideIcon(name, fallback)`. Replaces five `(LucideIcons as any)[name]` call sites across `Hero`, `DynamicLinksEditor`, `ProfileModal`, `FlowStep`, and the user profile page.
- **`TRUSTED_PROXY` environment variable** — opt-in flag for trusting `X-Forwarded-For`/`X-Real-IP` headers when behind a reverse proxy (Caddy, Nginx, Cloudflare).
- **`STRICT_CONTENT` environment variable** — when `true`, markdown parse errors throw instead of being logged. Use in CI to catch broken frontmatter.
- **Skip-to-content link** — WCAG 2.1 §2.4.1 compliance. `<a class="skip-link" href="#main-content">` inserted at the top of `<body>`, styled via `app/globals.css`, and targeting `id="main-content"` on the `<main>` element of all four layouts (`FullWidthLayout`, `CenteredLayout`, `SidebarLeftLayout`, `SidebarRightLayout`).
- **Themeable infographic accents** — `InfoCard` directive's named accent palette (cyan, teal, green, orange, etc.) now reads `var(--accent-cyan, #…)` so themes can override individual accents via CSS custom properties.
- **Alt-text prop on `Hero` and `RandomHeroImage`** — `Hero` marks the background image as decorative (`alt=""` + `role="presentation"`) since the `<h1>` already conveys meaning; `RandomHeroImage` accepts an explicit `alt` prop.

### Changed

- **Middleware matcher now covers `/api/*`** — previously excluded. The matcher was widened so the CSRF Origin check and body-size cap actually run on API routes. The existing language-rewrite logic still skips API paths internally.
- **Rate limiter IP source** — default is `request.ip`. Forwarded headers are only read when `TRUSTED_PROXY=true`. Per-email rate limit is the primary defense on `/api/auth/verify-otp`; IP is the secondary.
- **CSS variables for accents** — new optional `--accent-{cyan|teal|green|orange|yellow|purple|red|blue|pink}` variables available for theme overrides.

### Documentation

- **New: [UPGRADING to 0.4.0](./docs/UPGRADING.md)** — covers the `JWT_SECRET` breaking change and new optional env vars.
- **Updated: [SECURITY.md](./SECURITY.md)** — documents the shipped security headers, OTP hardening, CSRF stance, and URL-scheme allowlist.
- **Updated: [PRODUCTION-CHECKLIST.md](./docs/PRODUCTION-CHECKLIST.md)** — incorporates the new env-var requirements and trusted-proxy guidance.

### Files Added
- `lib/lucide-icon.ts` — Type-safe Lucide icon lookup helper

### Files Modified (framework)
- `next.config.js` — HSTS + CSP headers
- `middleware.ts` — CSRF Origin check, body-size cap, matcher widened to `/api/*`
- `lib/auth.ts` — JWT_SECRET required, constant-time OTP compare, clearAuthCookie attribute match
- `lib/markdown.ts` — Per-file try/catch, `STRICT_CONTENT` support
- `app/api/user/profile/route.ts` — URL scheme allowlist via Zod refine
- `components/ThemeLoader.tsx` — Removed `as any`, typed narrowing
- `components/ChatProvider.tsx` — Split effects, `hasLoadedHistory` ref
- `components/RandomHeroImage.tsx` — Post-mount random pick
- `components/Hero.tsx` — Decorative alt, `getLucideIcon` helper
- `components/Navigation.tsx` — Trailing-slash normalization
- `components/directives/InfoCard.tsx`, `FlowStep.tsx` — Theme-var accents, typed props
- `components/layouts/*.tsx` — `#main-content` anchor for skip link
- `components/modals/ProfileModal.tsx`, `DynamicLinksEditor.tsx` — Use `getLucideIcon`
- `components/Sidebar.tsx` — Accessible alt text
- `app/layout.tsx` — Skip link, removed stray `as any`
- `app/globals.css` — `.skip-link` styles

### Files Modified (site-specific, not upstream)
- `app/api/notifications/create/route.ts` — JWT auth, self-notification only
- `app/api/chat/stream/route.ts` — Body validation outside IIFE
- `app/api/auth/verify-otp/route.ts` — Trusted-proxy IP, email-primary rate limit
- `app/api/contact/route.ts` — Zod validation, JSON-line log format

## [0.3.0] - 2026-03-15

### Added
- **Stat directive icon support** — `:::stat{icon="clock"}` renders Lucide outline icons above stat values, dynamically resolved from the full Lucide icon set via kebab-case name lookup
- **Homepage infographic layout** — Redesigned index page using directive-based infographic sections (stats, info-cards, formula, flow, connectors, sections)

### Improved
- **Stat typography** — Replaced monospace (`Courier New`) font with heading font (`Playfair Display`) for stat values; reduced font size from `clamp(2rem, 5vw, 3rem)` to `clamp(1.5rem, 3.5vw, 2.2rem)` with tighter letter-spacing
- **Button content/presentation separation** — Removed all inline color styles from `Button.tsx`; button variants now styled entirely via CSS module classes, respecting the `.content a:not([role="button"])` exclusion pattern
- **CTA section cleanup** — Replaced connector boxes with clean prose; replaced oversized stat card ("Trusted across Belgium & Europe") with semantic `<h3>` heading

### Changed
- **Markdown directives system** — 23 directives across all three remark-directive types
  - **Container directives** (`:::name`):
    - `details` — Collapsible sections using native `<details>/<summary>`, supports `{summary="..."}` and `{open}` attributes
    - `tabs` — Tabbed content panels with `:::tab{label="..."}` children, interactive tab switching
    - `card` — Styled content cards with automatic image header extraction, heading as title, remaining content as body
    - `steps` — Numbered step-by-step instructions with timeline connector, auto-splits on `<h3>` elements
    - `formula` — Equation-style layout with `:::formula-card` children and operator symbols (`+`, `=`, `->`)
    - `flow` — Process flow diagram with `:::flow-step` children, directional arrows, and optional `{loop=true}`
    - `section` — Full-bleed background section with `{variant=dark|light|muted|gradient}` for page structure
  - **Leaf directives** (`::name`):
    - `youtube` — Responsive 16:9 YouTube embed via `youtube-nocookie.com`, lazy loading, `{id=...}` attribute
    - `button` — Styled CTA link with `{href=... label="..."}` and `{variant=primary|secondary|outline}`
    - `spacer` — Vertical whitespace mapped to theme spacing variables (`sm`, `md`, `lg`, `xl`)
    - `divider` — Decorative section breaks with `{style=dots|wave|gradient|fade}` variants
    - `stat` — Large statistics callout with `{value="..." label="..." color=cyan}` attributes
    - `connector` — Mapping row connecting two concepts with arrow and colored dots
  - **Text/inline directives** (`:name[content]{attrs}`):
    - `highlight` — Colored `<mark>` element with `{color=yellow|green|blue|pink|orange}` variants
    - `badge` — Inline status pill with `{color=primary|green|red|yellow|purple}` variants
    - `kbd` — Keyboard key styling, auto-splits compound shortcuts on `+` into separate keys
    - `abbr` — Click-to-popup abbreviation with accessible keyboard support and click-outside dismiss
  - **Infographic directives** (container/leaf):
    - `formula-card` — Card within `:::formula` layout, supports `{accent=cyan}`, badge, subtitle, and hashtag pills
    - `flow-step` — Step within `:::flow` layout, numbered with description
    - `info-card` — Numbered capability card with accent color, badge, subtitle, and inline hashtag pills
  - Named accent colors across infographic directives: cyan, teal, green, orange, yellow, purple, red, blue, pink
- `span` component override in MarkdownContent.tsx for routing text directives
- **Hashtag and tagging system** — inline `#TagName` syntax in markdown body text
  - `lib/remark-hashtags.ts` — Remark plugin transforms `#tag` into `<a href="/tags/tag" class="hashtag">`
  - Dual sources: frontmatter `tags: [...]` and inline `#hashtags` merged and deduplicated
  - Tag normalization: all tags lowercased and kebab-cased via `normalizeTag()`
  - Skipped contexts: headings, code blocks, inline code, existing links, HTML blocks
  - Key functions: `extractHashtags()`, `normalizeTag()`, `getAllTags()`, `getContentByTag()`
- **Tag pages** — `/tags` tag cloud and `/tags/{tag}` tag detail pages
  - `app/tags/page.tsx` — Tag cloud with post counts
  - `app/tags/[tag]/page.tsx` — Tag detail page with filtered content
  - `styles/Tags.module.css` — Tag page styling
- SEO/GEO infrastructure: auto-generated sitemap, robots.txt with AI crawler allowlisting, llms.txt for AI discoverability, JSON-LD schemas (WebSite, Organization, Person, Article, Breadcrumb, FAQ)
- Progressive visual effects: CSS-only scroll animations, depth cards with `color-mix()`, fluid typography with `clamp()`
- Theme system extensions: `EffectsSchema` and `AnimationsSchema` in theme schemas, hero text gradient support
- Markdown showcase page with GitHub-flavored markdown checkbox support
- Code block toolbar with copy button
- Modal-based UI system with theme component customization
- WCAG 2.1 accessibility improvements
- `prefers-reduced-motion` support and improved CSS architecture
- Relevance-based AI context selection and search index TTL cache

### Added Files
- `components/directives/Details.tsx` — Collapsible section component
- `components/directives/Tabs.tsx` — Tabbed panel component (client component)
- `components/directives/Card.tsx` — Content card with image/title extraction
- `components/directives/Steps.tsx` — Numbered steps with timeline
- `components/directives/YouTube.tsx` — Responsive YouTube embed
- `components/directives/Button.tsx` — CTA button with variant styles
- `components/directives/Spacer.tsx` — Vertical spacing component
- `components/directives/Divider.tsx` — Decorative divider with style variants
- `components/directives/Highlight.tsx` — Inline text highlight
- `components/directives/Badge.tsx` — Inline status badge
- `components/directives/Kbd.tsx` — Keyboard shortcut display
- `components/directives/Abbr.tsx` — Click-to-popup abbreviation (client component)
- `components/directives/Formula.tsx` — Formula equation layout
- `components/directives/FormulaCard.tsx` — Card within formula layout
- `components/directives/Flow.tsx` — Process flow diagram
- `components/directives/FlowStep.tsx` — Step within flow diagram
- `components/directives/InfoCard.tsx` — Numbered capability card
- `components/directives/Connector.tsx` — Concept mapping row
- `components/directives/Stat.tsx` — Statistics callout
- `components/directives/Section.tsx` — Full-bleed background section
- `lib/remarkDirectives.ts` — Remark plugin for directive AST transformation
- `lib/remark-hashtags.ts` — Remark plugin for inline hashtag transformation
- `styles/Directives.module.css` — Styles for all 23 directives (5 existing + 18 new)
- `styles/Tags.module.css` — Tag page and hashtag pill styling
- `app/tags/page.tsx` — Tag cloud page
- `app/tags/[tag]/page.tsx` — Tag detail page
- `app/sitemap.ts` — Auto-generated sitemap from content pages and blog posts
- `app/robots.ts` — Robots.txt with AI crawler allowlisting
- `app/llms.txt/route.ts` — Structured markdown for AI discoverability
- `components/JsonLd.tsx` — JSON-LD structured data (6 schema types)
- `lib/seo.ts` — Enhanced metadata with canonical URLs and robots directives

### Fixed
- Tabs nested rendering: outer `::::tabs` (4 colons) required for remark-directive nesting with inner `:::tab` (3 colons)
- Card images inheriting unwanted `border-radius` from `.content img` — reset in `.cardImage img`
- Button primary label invisible due to CSS specificity: `.content a` (0,1,1) overriding `.buttonPrimary` (0,1,0) — resolved with inline styles per variant
- React hydration errors in code blocks (plain text extraction, paragraph nesting, client-only toolbar)
- Security hardening across auth, headers, and input sanitization
- JWT_SECRET deferred to runtime for Next.js build compatibility
- Navigation duplicate entries

### Changed
- MarkdownContent.tsx extended with `div` switch cases for all container directives and new `span` override for text directives
- `components/directives/index.ts` barrel export expanded with 20 component exports (12 original + 8 infographic)
- `lib/markdown.ts` expanded with tag extraction, hashtag merging, and `getContentByTag()` function
- `BlogCard.tsx` updated with clickable tag links
- `package.json` updated with `remark-directive` dependency
- Removed development test files and artifacts from repository

## [0.2.0] - 2026-02-10

### User Features
- **Favourites/Bookmarking System**: Save and manage favourite pages and blog posts
  - `/favourites` page with search and filtering
  - Filter by type (pages vs blog posts)
  - Persistent storage in localStorage
  - Star icon on all pages for quick bookmarking
- **Loading States**: Smooth loading indicators for page transitions
  - Global loading component (`app/loading.tsx`)
  - Blog-specific loading state (`app/blog/loading.tsx`)
  - Translation loading overlay in language switcher

### Internationalization
- **Multi-language Support**: 17 languages supported with automatic detection
  - Languages: English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Turkish, Russian, Japanese, Korean, Chinese, Arabic, Hebrew, Thai, Hindi
  - Script-based detection: CJK, Cyrillic, Arabic, Hebrew, Thai, Devanagari, Latin
  - Browser language preference fallback
- **AI-Powered Translation Service**:
  - On-demand content translation using AI providers
  - Translation caching system (`.cache/translations/`)
  - Preserves markdown formatting and frontmatter
  - Content hash-based cache keys for efficiency
- **Language Routing Middleware**:
  - URL-based language selection (`/nl/`, `/fr/`, etc.)
  - Header-based language passing to components
  - Edge-compatible middleware
- **Language Switcher Component**:
  - Dropdown with flag icons for all languages
  - Loading state during translation
  - Automatic URL generation for language variants
  - Click-outside detection and keyboard navigation

### Authentication Enhancements
- **Avatar System Improvements**:
  - User icon fallback for missing profile pictures
  - Light/dark mode adaptation for icons
  - Consistent avatar component usage across app
  - Profile page layout enhancements
- **User Profile Features**:
  - Auto-resize profile images
  - Dynamic social links display
  - Influencer-style profile layouts

### Architectural Changes
- **Architectural Consolidation**: Removed duplicate chat components and legacy theme system
- Renamed `ChatProviderEnhanced` → `ChatProvider` and `ChatWindowEnhanced` → `ChatWindow`
- Removed legacy single-file theme system in favor of folder-based themes
- Completed sidebar implementation with real data sources for categories, tags, and recent posts
- Version aligned to 0.2.0 (dropping alpha designation)
- `getActiveTheme()` now returns `FullTheme` directly instead of legacy `Theme` type

### Added Files
- `lib/language-detector.ts` - Language detection utilities (17 languages)
- `lib/translation-service.ts` - AI translation with caching
- `middleware.ts` - Language routing middleware
- `components/LanguageSwitcher.tsx` - Language selection UI with flags
- `components/FavouritesList.tsx` - Favourites management component
- `components/CenterChatLayout.tsx` - Centered chat layout option
- `components/ChatSidebar.tsx` - Chat sidebar component
- `app/favourites/page.tsx` - Favourites management page
- `app/api/favorites/route.ts` - Favourites API endpoint
- `app/loading.tsx` - Global loading component
- `app/blog/loading.tsx` - Blog loading component
- `styles/Favourites.module.css` - Favourites styling
- `styles/LanguageSwitcher.module.css` - Language switcher styling
- `styles/Loading.module.css` - Loading component styling
- Helper functions in `lib/markdown.ts`: `getAllTags()`, `getAllCategories()`, `getRecentBlogPosts()`
- Social links configuration in `config/site.yaml` and schema
- Social links widget with icons (Twitter, GitHub, LinkedIn, YouTube, Instagram)
- Full data wiring for all sidebar widgets

### Fixed
- Version confusion between package.json and changelogs
- TODOs in Sidebar component now resolved with real data
- React hydration errors in AuthButton
- Avatar fallback handling for missing user images

### Removed
- `components/ChatProvider.tsx` (legacy, superseded by Enhanced version)
- `components/ChatWindow.tsx` (legacy, superseded by Enhanced version)  
- `lib/theme-loader.ts` (legacy theme system)
- `lib/theme-schema.ts` (legacy theme types)
- Single-file themes: `default.yaml`, `modern.yaml`, `minimal.yaml`, `dark.yaml`, `vibrant.yaml`
- `getActiveFullTheme()` function (merged with `getActiveTheme()`)
- Development test files and artifacts (`__tests__/`, `__mocks__/`, `e2e/`, `coverage/`)
- Development documentation and test reports

## [0.1.0-alpha.2] - 2024-12-28

### Added
- **Multi-theme system** with 5 built-in themes
  - `themes/default.yaml` - Clean, professional blue theme
  - `themes/modern.yaml` - Contemporary teal/cyan theme
  - `themes/minimal.yaml` - High-contrast black/white minimalist theme
  - `themes/dark.yaml` - Purple/pink dark-first theme
  - `themes/vibrant.yaml` - Colorful orange/green theme
- **Custom theme support**
  - `themes-custom/` directory for user themes (gitignored)
  - Full theme schema with colors, typography, spacing, layout
  - Theme schema validation with Zod (`lib/theme-schema.ts`)
- **Theme configuration** in YAML
  - `branding.theme` - Select theme by name (e.g., "modern", "custom/my-theme")
  - `branding.overrides` - Override specific theme values without creating full custom theme
  - Theme resolution: custom → template → default fallback
  - "custom/" prefix for explicit custom theme reference
- **Theme setup script**
  - `npm run setup:theme` - List available themes and show setup instructions
- **Comprehensive theme documentation**
  - `docs/THEMES.md` - Complete theme guide with examples and best practices
  - Updated `docs/CONFIGURATION.md` with theme configuration section
  - Updated `docs/QUICKSTART.md` with theme selection step
  - Updated `README.md` with theming features
- **Dual-configuration system** for conflict-free customization
  - `config/site.yaml` - Template config (git-tracked)
  - `config/site.local.yaml` - User overrides (gitignored)
  - Deep merge: user config overrides template defaults
  - Users only specify settings they want to change
- **Dual-directory content system** for conflict-free content management
  - `content/` - Template content (git-tracked)
  - `content-custom/` - User content (gitignored, default location)
  - Configurable content path via `content.customDirectory` in config
  - Priority: custom directory → content-custom → content
- **Setup scripts** for easy onboarding
  - `npm run setup` - Complete setup (config + content)
  - `npm run setup:config` - Create user config with examples
  - `npm run setup:content` - Copy template content to custom directory
- **Content directory configuration** in YAML
  - `content.customDirectory` - Path to user content
  - `content.templateDirectory` - Path to template content
- **Comprehensive documentation**
  - `docs/CONTENT-MANAGEMENT.md` - Complete content management guide
  - Updated `docs/QUICKSTART.md` with setup workflow
  - Updated `docs/CONFIGURATION.md` with dual-config system
  - Updated `README.md` with new quick start

### Changed
- **ESLint configuration** added with strict Next.js rules
  - Enforces accessibility best practices via `next/core-web-vitals`
  - Prevents `any` type usage for better type safety
  - Enforces proper React keys in list operations
  - Allows only `console.warn` and `console.error` in production code
- **Code quality improvements**
  - Fixed array index keys in `components/Search.tsx` and `components/ChatWindow.tsx` to use unique identifiers
  - Replaced `any` types with proper TypeScript types in `lib/config.ts`, `lib/seo.ts`, and `lib/markdown.ts`
  - Improved type safety in utility functions (`deepMerge`, `isObject`)
  - Added `.eslintignore` to exclude setup scripts from linting
- **ThemeLoader component** completely rewritten (`components/ThemeLoader.tsx`)
  - Now loads full theme objects instead of just branding colors
  - Dynamically injects all CSS custom properties (colors, typography, spacing, layout)
  - Supports automatic dark mode color injection via dynamic `<style>` element
  - Converts camelCase theme properties to kebab-case CSS variables
- **Configuration schema** updated (`lib/config.ts`)
  - `branding` section now includes `theme` and `overrides` fields
  - Added `ThemeOverridesSchema` for partial theme customization
  - Legacy `primaryColor`, `secondaryColor`, `fontFamily` still supported but deprecated
  - New `getActiveTheme()` function to load and merge themes
  - Improved type safety in `deepMerge` and `isObject` functions
- **Client configuration API** updated (`lib/config.ts`)
  - `getClientSafeConfig()` now exposes full theme colors for client use
  - Theme data available to client components for dynamic styling
- **Configuration loading** (`lib/config.ts`)
  - Added `ContentConfigSchema` for content path configuration
  - Implemented deep merge for config files
  - Support for optional `site.local.yaml`
- **Content resolution** (`lib/markdown.ts`)
  - Dynamic content directory resolution based on config
  - Fallback chain: custom → content-custom → content
  - Warning when configured path doesn't exist
  - Improved type safety in `parseMarkdown` function
- **SEO metadata generation** (`lib/seo.ts`)
  - Proper TypeScript Metadata type instead of `any`
  - Type-safe metadata object construction
- Updated `.gitignore` to exclude:
  - `themes-custom/` (user custom themes)
  - `config/site.local.yaml` (user config)
  - `content-custom/` (user content)
- Updated `.cursorrules` with theme system patterns and ESLint standards

### Deprecated
- **Direct branding colors in config** (still functional but deprecated)
  - `branding.primaryColor`, `branding.secondaryColor`, `branding.fontFamily`
  - Users should migrate to `branding.theme` and `branding.overrides`
  - Legacy config still works with console warning in `getActiveTheme()`

### Fixed
- Git conflicts when users customize configuration
- Git conflicts when users customize content
- Template updates overwriting user customizations

### Security
- User config, content, and themes are gitignored and safe from accidental commits
- Template updates never touch user files

## [0.1.0-alpha.1] - 2024-12-27

### Added
- First public alpha release on GitHub
- Ready for community testing and feedback

### Fixed
- Updated documentation links in content files to point to GitHub repository instead of local file paths

## [0.1.0] - 2024-12-25

### Added
- Initial alpha release
- AI chat integration with multi-provider support (Anthropic, OpenAI, Gemini, Ollama)
- YAML-based configuration system (`config/site.yaml`)
- Markdown-based content management system
- Auto-generated navigation from folder structure
- Full-text search functionality across all content
- Blog system with date-based posts and tags
- Contact form with validation
- Dark/light mode support with system preference detection
- Responsive design with mobile-first approach
- Comprehensive test suite (Jest + Playwright)
  - 51/51 unit tests passing (100%)
  - Full E2E test coverage
- Complete documentation in `docs/` directory
  - Configuration guide
  - Testing guide
  - Quick start guide
  - Chat positions reference
  - Icon library reference
- GitHub templates for issues and pull requests
- Security policy (SECURITY.md)
- Contributing guidelines (CONTRIBUTING.md)
- MIT License
- Environment variable template (env.template)

### Changed
- Replaced example content with generic "SuperSite" branding
- Reorganized documentation into `docs/` and `docs/dev/` directories
- Updated test suite to 100% pass rate
- Updated `.gitignore` to exclude sensitive files (.cursorrules, .env)
- Set version to 0.1.0 for alpha release
- Updated package.json with repository information and keywords

### Security
- All API keys secured via `.env.local` (gitignored)
- Client-safe configuration API endpoint
- Server-side only AI provider access
- Input validation on all forms and API routes
- CSRF protection enabled
- Markdown rendering safe from XSS attacks

---

**Note**: This is an alpha release. APIs and configuration may change in future versions.
