# Handover Briefing — CoachSteff.live Visual & SEO Upgrade

**Date:** 2026-03-13
**Session:** 260313-spry-galaxy
**Status:** Implementation complete, build passes, but **runtime errors observed** — user reported Internal Server Error on page load in the browser. The error is intermittent/unclear — curl returns 200 but the browser may behave differently (possibly a client-side hydration issue or SSR-specific error).

---

## What Was Done

A comprehensive upgrade to the SuperSite framework, using CoachSteff.live as the validation instance. The changes fall into four categories:

### 1. SEO & GEO (Generative Engine Optimization) Infrastructure

| File | Type | What |
|------|------|------|
| `app/robots.ts` | **NEW** | Dynamic robots.txt with explicit AI crawler allowlisting (GPTBot, ClaudeBot, PerplexityBot, etc.) |
| `app/sitemap.ts` | **NEW** | Auto-generated sitemap.xml from content pages and blog posts; respects `noindex` frontmatter |
| `app/llms.txt/route.ts` | **NEW** | Dynamic llms.txt endpoint for AI discoverability; builds from site config |
| `components/JsonLd.tsx` | **NEW** | Reusable JSON-LD component with 6 schema builders: WebSite, Organization, Person, Article, Breadcrumb, FAQ |
| `lib/seo.ts` | **MODIFIED** | Added `metadataBase`, canonical URLs via `alternates.canonical`, enhanced robots directives (`max-snippet: -1`, `max-image-preview: large`) |
| `app/layout.tsx` | **MODIFIED** | Added WebSite + Organization JSON-LD in `<head>`, enhanced `generateMetadata` with `metadataBase`, `title.template`, robots directives |
| `app/[...slug]/page.tsx` | **MODIFIED** | Added breadcrumb JSON-LD to all content pages |
| `app/blog/[slug]/page.tsx` | **MODIFIED** | Added article + breadcrumb JSON-LD to blog posts |

### 2. Theme System Extensions

| File | Type | What |
|------|------|------|
| `lib/theme-system/schemas.ts` | **MODIFIED** | Added `EffectsSchema` (cardSurfaceTint, cardBorderTint, cardShadow, hoverLift, textGradient), `AnimationsSchema` (scrollReveal, microInteractions, pageTransitions, reducedMotionRespect), `ScrollBehaviorSchema`, updated `HeaderSchema` with `scrollBehavior`/`scrollBackground`, updated `ColorsSchema` to include effects + animations |
| `themes/base/colors.yaml` | **MODIFIED** | Added effects (all off) and animations (all off) as safe defaults |
| `components/ThemeLoader.tsx` | **MODIFIED** | Added effects CSS variable application; **FIXED PRE-EXISTING BUG** where `themeData.typography`/`spacing`/`borderRadius` were read at wrong path (should be `themeData.colors.typography` etc.) |

### 3. Visual Upgrades (CSS & Components)

| File | Type | What |
|------|------|------|
| `app/globals.css` | **MODIFIED** | +226 lines: accessible motion foundation (`prefers-reduced-motion`), scroll-driven animations (`animation-timeline: view()`), depth card system using `color-mix()`, micro-interactions, fluid typography (`clamp()`), dark mode transition, text gradient utility |
| `components/Header.tsx` | **MODIFIED** | Added `scrollBehavior`/`scrollBackground` props, scroll detection with direction tracking, auto-hide on scroll down |
| `styles/Header.module.css` | **MODIFIED** | Added `.scrolled` class (color-mix bg + shadow), `.hidden` class (translateY -100%) |
| `components/Hero.tsx` | **MODIFIED** | Added `data-animate="fade-up"` attributes for scroll-driven animations, text gradient class on heading |
| `styles/Hero.module.css` | **MODIFIED** | Fluid font sizing with `clamp()`, text gradient class, theme-aware CTA hover shadow using `color-mix()` |

### 4. Site-Specific Theme Config (gitignored)

| File | What |
|------|------|
| `themes-custom/parchment-sky/colors.yaml` | Added effects (cardSurfaceTint: 4, cardBorderTint: 12, cardShadow: layered, hoverLift: true, textGradient: true) and animations (all true) |
| `themes-custom/parchment-sky/structure.yaml` | Added `scrollBehavior: "auto-hide"` and `scrollBackground: true` to header section |

---

## Current Problem: Internal Server Error

### What the user reported
> "I get a 'Internal Server Error' when I refresh or force-refresh the site on localhost:3001"

### What we know
- `npm run build` succeeds cleanly (only pre-existing dynamic route warnings)
- `curl -s http://localhost:3001/` returns HTTP 200
- All routes return 200 via curl (tested: /, /about, /blog, /contact, /services, /sitemap.xml, /robots.txt, /llms.txt)
- After killing and restarting the dev server, curl returned 200
- **BUT the user still reported the error**, and when we tried to verify with the in-app browser, `navigate http://localhost:3001` timed out after 30s
- The error may be **client-side** (hydration mismatch, client component error) or **intermittent SSR** that only manifests in a real browser, not curl

### Likely causes to investigate (in priority order)

1. **JsonLd component in `<head>`** — The `<script type="application/ld+json">` tags are rendered inside `<head>` in `layout.tsx`. While this is valid HTML, Next.js might have issues with this during hydration. The `dangerouslySetInnerHTML` inside `<head>` could cause a hydration mismatch between server and client renders.

2. **`new URL(config.site.url)` in `metadataBase`** — If `config.site.url` is `https://coachsteff.live` but the page is loaded on `http://localhost:3001`, this mismatch could cause issues. Check if `metadataBase` needs to be conditional on environment.

3. **ThemeLoader data path fix** — The fix changed `themeData.typography` → `themeData.colors?.typography` (and same for spacing, borderRadius). This is correct per the Zod schema, but if any other code depended on the old (broken) paths, it could surface errors.

4. **Header scroll behavior** — The `(header as any).scrollBehavior` cast in `layout.tsx` is a smell. If the header config object doesn't actually have these properties at runtime (despite the schema), this could cause issues.

5. **Hydration mismatch from scroll state** — `Header.tsx` now has `scrolled` and `hidden` state that's only set client-side via `useEffect`. The server renders with `scrolled=false, hidden=false`. If the initial client render doesn't match (e.g., due to scroll restoration), this would cause a hydration error.

6. **CSS scroll-driven animations** — The `@supports (animation-timeline: view())` block in `globals.css` should be harmless, but verify it doesn't cause parsing errors in the dev server's CSS processing.

### How to debug

1. **Check the browser console** — Open Chrome DevTools on localhost:3001 and look at the Console tab for React hydration errors, runtime errors, or unhandled promise rejections.

2. **Check the terminal** — The Next.js dev server should print the actual error stack trace when a 500 occurs. Watch the terminal output while loading the page.

3. **Disable changes incrementally** — If the error persists:
   - First, remove the `<JsonLd>` components from `layout.tsx` (lines ~110-111)
   - Then try removing the `scrollBehavior`/`scrollBackground` props from the Header in `layout.tsx`
   - Then try reverting the `metadataBase` change in `generateMetadata`

---

## Git State

**Branch:** `main` (up to date with origin)
**Nothing staged.** All changes are unstaged modifications + 5 new untracked files.

### Modified files (12)
```
M  app/[...slug]/page.tsx        (+24 lines)
M  app/blog/[slug]/page.tsx      (+10 lines)
M  app/globals.css               (+226 lines)
M  app/layout.tsx                (+20 lines)
M  components/Header.tsx         (+39 lines)
M  components/Hero.tsx           (+6 lines)
M  components/ThemeLoader.tsx    (+26 lines)
M  lib/seo.ts                   (+20 lines)
M  lib/theme-system/schemas.ts  (+36 lines)
M  styles/Header.module.css     (+16 lines)
M  styles/Hero.module.css       (+16 lines)
M  themes/base/colors.yaml      (+13 lines)
```

### New files (5)
```
?? app/llms.txt/route.ts
?? app/robots.ts
?? app/sitemap.ts
?? components/JsonLd.tsx
?? DEPLOY-BRIEFING.md          (from a previous session, not related)
```

### Total: +420 lines, -32 lines across 17 files

---

## Design Decisions & Constraints

1. **No glassmorphism** — Steff explicitly rejected it for legibility. Uses "Layered Depth Cards" instead: solid tinted backgrounds via `color-mix()`, crisp borders, layered shadows.

2. **Framework-first** — All changes must work as generic SuperSite framework capabilities, configurable via YAML. CoachSteff.live enables features through theme YAML; the base theme keeps them all off by default.

3. **No new dependencies** — All visual effects use native CSS: `scroll-timeline`, `color-mix()`, `clamp()`, `@starting-style`. No JS animation libraries.

4. **Backward compatibility** — All new Zod schema properties use `.default()` so existing themes that don't specify effects/animations won't break.

5. **Accessible by default** — `@media (prefers-reduced-motion: reduce)` kills all animations. Scroll-driven animations gated behind `@supports`.

---

## What's NOT Done Yet

### From the original plan:
- **Phase 3: Content restructuring** — Updating content pages with TL;DR-first patterns, question-based headings, FAQ sections with JSON-LD. This is site-specific (content-custom/) and was lower priority.
- **Chat window refinement** — Depth card styling, smooth open/close animation for the chat widget.
- **Visual verification** — Nobody has actually seen the site render in a browser yet. The visual effects (scroll animations, depth cards, text gradient, auto-hide header) need visual QA.

### Immediate priorities:
1. **Fix the Internal Server Error** — This blocks everything else
2. **Visual QA in browser** — Verify all the CSS changes look correct
3. **Test dark mode** — The depth card system, text gradient, and header scroll behavior all have dark mode variants
4. **Test on mobile viewports** — Fluid typography and scroll behavior

---

## Key File Paths

| File | Purpose |
|------|---------|
| `config/site.local.yaml` | Site-specific config (gitignored) |
| `themes-custom/parchment-sky/colors.yaml` | Active theme colors + effects + animations |
| `themes-custom/parchment-sky/structure.yaml` | Active theme layout + header scroll config |
| `lib/theme-system/schemas.ts` | Zod schemas for all theme YAML |
| `components/ThemeLoader.tsx` | Runtime theme application (CSS variables) |
| `app/globals.css` | CSS foundation (animations, depth cards, typography) |
| `components/JsonLd.tsx` | JSON-LD structured data component |
| `app/layout.tsx` | Root layout — where JSON-LD + Header props are wired |
| `CLAUDE.md` | Full project architecture reference |

---

## How to Revert Everything

If needed, all changes can be cleanly reverted:

```bash
# Revert all modified files
git checkout -- app/ components/ lib/ styles/ themes/

# Remove new files
rm -f app/robots.ts app/sitemap.ts components/JsonLd.tsx
rm -rf app/llms.txt/

# Theme config changes (gitignored, manual revert):
# Remove the effects: and animations: sections from themes-custom/parchment-sky/colors.yaml
# Remove scrollBehavior and scrollBackground from themes-custom/parchment-sky/structure.yaml
```
