# SuperSite v0.3.0 Release Notes

**Release Date:** March 15, 2026

## What's New

SuperSite 0.3.0 is a feature release focused on content authoring, discoverability, and visual polish. It introduces a comprehensive markdown directives system, a hashtag-based tagging system, SEO/GEO infrastructure for AI discoverability, and progressive visual effects.

## Highlights

### 23 Markdown Directives

A full directive system powered by `remark-directive` enables rich content layouts without writing code. Directives span four categories:

- **Container directives** — `details`, `tabs`, `card`, `steps`, `formula`, `flow`, `section`
- **Leaf directives** — `youtube`, `button`, `spacer`, `divider`, `stat`, `connector`
- **Text/inline directives** — `highlight`, `badge`, `kbd`, `abbr`
- **Infographic directives** — `formula-card`, `flow-step`, `info-card` with named accent colors

All directives support light and dark mode and are styled via CSS modules.

### Hashtag and Tagging System

Write `#TagName` inline in any markdown content. Hashtags are automatically transformed into linked tags and merged with frontmatter `tags: [...]`. Tag pages are auto-generated:

- `/tags` — Tag cloud with post counts
- `/tags/{tag}` — Filtered content for each tag

### SEO/GEO Infrastructure

- **sitemap.xml** — Auto-generated from all content pages and blog posts
- **robots.txt** — AI crawler allowlisting for GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- **llms.txt** — Structured markdown endpoint for AI system discoverability
- **JSON-LD** — 6 schema types: WebSite, Organization, Person, Article, Breadcrumb, FAQ
- **Enhanced metadata** — Canonical URLs, robots directives, Open Graph, Twitter Cards

### Progressive Visual Effects

- CSS-only scroll animations via `animation-timeline: view()` (Chrome/Edge, progressive enhancement)
- Depth cards using `color-mix()` for tinted surfaces
- Fluid typography with `clamp()` on headings
- Hero text gradient controlled by theme settings
- All effects respect `prefers-reduced-motion`

## Breaking Changes

None. This is a backward-compatible feature release.

## Upgrade from 0.2.0

1. Pull latest changes
2. Run `npm install` (new dependency: `remark-directive` was added in a prior commit, but verify it's installed)
3. Run `npm run build` to verify

No configuration changes required. All new features are opt-in through content authoring (directives, hashtags) or automatically active (SEO infrastructure, visual effects controlled by theme).

## Requirements

- Node.js 18+
- npm 9+

## Quick Start

```bash
git clone https://github.com/coachsteff/supersite.git
cd supersite
npm install
npm run setup
npm run dev
```

Visit http://localhost:3001

## Documentation

- [CHANGELOG.md](../../CHANGELOG.md) — Detailed list of all changes
- [CONTENT-MANAGEMENT.md](../CONTENT-MANAGEMENT.md) — Directives and hashtag usage guide
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Updated system architecture
- [CONFIGURATION.md](../CONFIGURATION.md) — Configuration reference

## What's Next

- Structure rendering (layout types, hero variants, footer styles)
- Blocks system (sidebar widgets, section blocks)
- Bundle size optimization and Lighthouse improvements

---

**Part of the Super family:** [superskills](https://github.com/coachsteff/superskills)

**Built with Next.js, TypeScript, and AI**
