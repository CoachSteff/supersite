# CLAUDE.md — CoachSteff.live (SuperSite Instance)

This is the **CoachSteff.live** website — a customized instance of the [SuperSite](https://github.com/coachsteff/supersite) framework. Understanding the framework vs. site-specific boundary is critical before making any changes.

## Quick Reference

- **Framework:** Next.js 14 App Router (TypeScript)
- **Dev server:** `npm run dev` (port 3001)
- **Build:** `npm run build` → `npm start`
- **Content:** Markdown files in `content-custom/pages/` and `content-custom/blog/`
- **Active theme:** `parchment-sky` (in `themes-custom/parchment-sky/`)
- **Config override:** `config/site.local.yaml`

## Architecture Overview

```
coachsteff.live/
├── app/                    # Next.js App Router (FRAMEWORK)
│   ├── layout.tsx          # Root layout with providers
│   ├── [...slug]/page.tsx  # Dynamic page route
│   ├── blog/[slug]/        # Blog post route
│   ├── contact/            # Contact form route
│   ├── api/                # API routes (chat, auth, notifications, search)
│   └── globals.css         # Global CSS variables & resets
├── components/             # React components (FRAMEWORK)
│   ├── Header.tsx          # Site header & navigation
│   ├── Footer.tsx          # Site footer
│   ├── Hero.tsx            # Homepage hero section
│   ├── ThemeLoader.tsx     # Applies theme CSS variables at runtime
│   ├── ChatProvider.tsx    # AI chat state management
│   └── ...                 # 40+ components
├── lib/                    # Utilities & core logic (FRAMEWORK)
│   ├── config.ts           # YAML config loader & validator
│   ├── markdown.ts         # Markdown parser (gray-matter + remark)
│   ├── ai-providers.ts     # AI abstraction (Anthropic, OpenAI, Gemini, Ollama)
│   ├── translation-service.ts  # AI-powered translation + caching
│   ├── theme-system/       # Theme loader, schema, component mapping
│   └── ...                 # Auth, email, search, SEO, etc.
├── styles/                 # CSS Modules (FRAMEWORK)
├── themes/                 # Built-in themes (FRAMEWORK)
│   ├── base/               # Default fallback theme
│   ├── blog/, business/    # Other built-in themes
│   └── ...
├── config/
│   ├── site.yaml           # Framework defaults (TRACKED)
│   └── site.local.yaml     # Site-specific overrides (GITIGNORED)
├── content/                # Template content (FRAMEWORK)
├── content-custom/         # Site content (GITIGNORED)
│   ├── pages/              # Markdown pages (about, services, products, etc.)
│   └── blog/               # Blog posts
├── themes-custom/          # Custom themes (GITIGNORED)
│   ├── parchment-sky/      # Active theme
│   └── coachsteff/         # Previous "Clear Teal" theme
├── public/                 # Static assets
│   └── images/             # Site images & logo
├── scripts/                # Setup scripts (setup-config, setup-content, setup-theme)
└── data/                   # User/auth data (GITIGNORED)
```

## The Framework vs. Site-Specific Boundary

This is the most important concept in this project. SuperSite is designed to be forked and customized, with a clean separation between framework code and site-specific content.

### What's tracked in Git (framework code — pushed to GitHub)

Everything that makes SuperSite work as a generic framework:
- `app/`, `components/`, `lib/`, `styles/` — application code
- `themes/` — built-in themes
- `content/` — template/sample content
- `config/site.yaml` — generic framework defaults
- `scripts/`, `docs/`, `__tests__/` — tooling

### What's gitignored (site-specific — stays local)

Everything specific to CoachSteff.live:
- `config/site.local.yaml` — site name, branding, navigation, chat config, social links
- `content-custom/` — all page content and blog posts
- `themes-custom/` — Parchment Sky and Clear Teal themes
- `.env.local` — API keys (GEMINI_API_KEY, JWT_SECRET)
- `data/` — user accounts and authentication data
- `.cache/` — translation cache

### Rules for changes

1. **Content changes** (pages, blog posts) → edit files in `content-custom/`
2. **Theme changes** (colors, fonts, spacing) → edit files in `themes-custom/parchment-sky/`
3. **Config changes** (site name, navigation, chat) → edit `config/site.local.yaml`
4. **Framework improvements** (bug fixes, new features) → edit framework files, commit to Git
5. **NEVER put site-specific branding in framework files** — this breaks the separation

### Known site-specific modifications in framework files

The following framework files contain CoachSteff-specific customizations that should NOT be pushed to the SuperSite GitHub repo:

- `components/Header.tsx` — Logo says "Steff." with accent dot (framework default: configurable)
- `components/Footer.tsx` — CoachSteff copyright and links
- `components/CookieConsent.tsx`, `AnonymousCookieNotice.tsx`, `CookiePreferencesForm.tsx`, `components/settings/CookieSettings.tsx` — Brand name "CoachSteff.live"
- `styles/*.module.css` — Various styling tweaks for CoachSteff brand
- `app/globals.css` — Parchment Sky color fallbacks (should be generic)
- `app/layout.tsx` — Hardcoded Google Fonts (Inter + Playfair Display)

When committing to the SuperSite repo, these files must be reverted or excluded.

## Configuration System

Configuration loads in layers with priority:

```
config/site.local.yaml  (highest — site-specific, gitignored)
        ↓ overrides ↓
config/site.yaml        (lowest — framework defaults, tracked)
```

### Key config sections

| Section | Purpose |
|---------|---------|
| `site.*` | Name, description, URL, logo, favicon |
| `branding.theme` | Active theme name (loads from themes-custom/ first, then themes/) |
| `navigation.customLinks` | Header nav links |
| `chat.*` | AI chat provider, model, system prompt, UI settings |
| `features.*` | Toggle search, blog, contactForm, analytics |
| `multilingual.*` | Languages, AI translation, caching |
| `hero.*` | Homepage hero heading, subheading, CTA |
| `social.*` | Social media links for footer |
| `seo.*` | Default titles, descriptions, OG image |

## Theme System

### How themes work

1. `lib/config.ts` reads `branding.theme` from config (e.g., `parchment-sky`)
2. `lib/theme-system/loader.ts` looks for theme in `themes-custom/` first, then `themes/`
3. Each theme has 4 YAML files: `colors.yaml`, `structure.yaml`, `blocks.yaml`, `theme.yaml`
4. `ThemeLoader.tsx` applies colors as CSS custom properties via `root.style.setProperty()`
5. These inline styles override any `:root` CSS declarations in `globals.css`

### Current theme: Parchment Sky

- **Location:** `themes-custom/parchment-sky/`
- **Light mode:** Primary `#00BFFF` (DeepSkyBlue), Background `#FAF6F1` (warm parchment)
- **Dark mode:** Primary `#33CCFF`, Background `#1A1614` (warm deep dark)
- **Fonts:** Inter (body) + Playfair Display (headings)
- **Border radius:** 12px

### Previous theme: Clear Teal

- **Location:** `themes-custom/coachsteff/`
- **To revert:** Set `branding.theme: coachsteff` in `config/site.local.yaml`

## Content System

Pages are Markdown files with YAML frontmatter:

```markdown
---
title: About Steff
description: AI adoption expert, trainer, coach, and author
---

Page content in Markdown...
```

- **Pages:** `content-custom/pages/{slug}/index.md` → renders at `/{slug}`
- **Blog:** `content-custom/blog/{date}-{slug}.md` → renders at `/blog/{slug}`
- **Fallback:** If a page doesn't exist in `content-custom/`, the framework looks in `content/`

## Multilingual Support

- Enabled for English, Dutch, and French (`en`, `nl`, `fr`)
- AI-powered translation via the configured chat provider (Gemini)
- Translations cached in `.cache/translations/`
- Language detection in `middleware.ts` via URL prefix (`/nl/about`, `/fr/contact`)
- `lib/translation-service.ts` handles translation with graceful error fallback

## AI Chat

- Provider: Gemini (`gemini-2.0-flash`) — configured in `site.local.yaml`
- System prompt describes Steff's work, frameworks, and how to help visitors
- Features: voice input, keyboard shortcuts (Cmd+K), action system (navigation, search)
- Memory: retains up to 50 messages per session

## Environment Variables

Required in `.env.local`:

```
GEMINI_API_KEY=...    # For AI chat and translation
JWT_SECRET=...        # For authentication tokens
```

## Development

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
npm test             # Jest tests (watch mode)
npm run test:ci      # Jest tests (CI mode with coverage)
npm run test:e2e     # Playwright E2E tests
```

## Build Notes

- Dynamic route warnings during build are normal (API routes use `cookies()` and `unstable_noStore`)
- Google Fonts loaded via `<link>` in `layout.tsx` — generates a Next.js font optimization warning but works fine
- CSP violation for base64 `data:` fonts is pre-existing and non-blocking

## Deployment

- **Target:** Hostinger VPS at `69.62.106.56`
- **Domain:** `coachsteff.live` (DNS already pointing to server)
- **Stack:** Node.js + PM2 + Nginx reverse proxy + Let's Encrypt SSL
- **Deploy workflow:** `git pull` → `npm ci` → `npm run build` → `pm2 restart coachsteff`
- **Site-specific files** (`.env.local`, `config/site.local.yaml`, `content-custom/`, `themes-custom/`) must be placed on the server manually — they are not in Git.

## Git Conventions

- Framework improvements: commit and push to `github.com/coachsteff/supersite`
- Site-specific changes: keep local, never push
- Commit messages: conventional commits (`fix:`, `feat:`, `refactor:`, `docs:`)
- Co-author line: `Co-Authored-By: Craft Agent <agents-noreply@craft.do>`

## Do NOT

- Put CoachSteff branding in `config/site.yaml` (use `site.local.yaml`)
- Modify `themes/base/` for site-specific styling (use `themes-custom/`)
- Hardcode theme colors in `globals.css` (ThemeLoader handles this at runtime)
- Hardcode font families in `layout.tsx` (should come from theme config)
- Commit `.env.local`, `data/`, or `contact-submissions.log`
- Push site-specific component modifications (Header logo, Footer content) to the SuperSite repo
