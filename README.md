# SuperSite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)

> **Version 0.3.0** — Markdown directives, hashtag tagging, SEO/GEO infrastructure, and visual effects

A universal, AI-powered website framework built with Next.js. Fully configuration-driven through YAML files and markdown content. Features an intelligent AI chat assistant, 23 markdown directives for rich content layouts, a hashtag-based tagging system, and comprehensive SEO/GEO infrastructure.

Part of the **Super** family: [superskills](https://github.com/coachsteff/superskills)

[Read the Release Notes](./docs/dev/RELEASE_NOTES.md) | [Quick Start Guide](./docs/QUICKSTART.md) | [Full Documentation](./docs/CONFIGURATION.md)

## Key Features

### Content Authoring
- **23 Markdown Directives** — Rich content layouts without code: tabs, cards, steps, formulas, flow diagrams, info cards, stats, and more
- **Hashtag Tagging** — Write `#TagName` inline; tags are auto-extracted, merged with frontmatter tags, and linked to tag pages
- **Tag Pages** — Auto-generated tag cloud (`/tags`) and per-tag detail pages (`/tags/{tag}`)
- **Markdown-Based CMS** — All content in simple markdown files with YAML frontmatter
- **Blog System** — Date-based posts with tags, categories, and metadata

### AI-Powered
- **Intelligent Chat Assistant** — AI chatbot that understands your site content
- **Multi-Provider Support** — Anthropic Claude, OpenAI GPT, Google Gemini, or local Ollama
- **Multilingual Support** — Automatic language detection and response in 17 languages
- **Context-Aware** — Automatically uses your markdown content to answer questions

### SEO/GEO Infrastructure
- **Auto-Generated Sitemap** — Dynamic `sitemap.xml` from all content pages and blog posts
- **AI Crawler Allowlisting** — `robots.txt` configured for GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- **AI Discoverability** — `llms.txt` structured markdown endpoint for AI systems
- **JSON-LD Schemas** — 6 schema types: WebSite, Organization, Person, Article, Breadcrumb, FAQ
- **Enhanced Metadata** — Canonical URLs, robots directives, Open Graph, Twitter Cards

### Visual Effects
- **CSS-Only Scroll Animations** — Progressive enhancement via `animation-timeline: view()`
- **Depth Cards** — Tinted surfaces using `color-mix()` for layered visual depth
- **Fluid Typography** — Responsive heading sizes with `clamp()`
- **Hero Text Gradient** — Theme-controlled gradient headings
- **Motion Safety** — All effects respect `prefers-reduced-motion`

### Theme System
- **Folder-Based YAML Themes** — Each theme is 4 YAML files: colors, structure, blocks, metadata
- **Custom Theme Support** — Create themes in `themes-custom/` (git-ignored)
- **6 Built-in Theme Templates** — base, blog, influencer, business, community, chatbot
- **Automatic Dark Mode** — All themes include light and dark variants
- **CSS Custom Properties** — Dynamic styling injected at runtime by ThemeLoader

### Configuration-Driven
- **YAML Configuration** — All settings in `config/site.yaml` with local overrides in `config/site.local.yaml`
- **No Code Changes** — Customize branding, features, and AI without touching code
- **Dual-Config System** — Template config (tracked) + user overrides (git-ignored), deep-merged
- **Dual-Content System** — Template content + user content, with priority resolution

### Modern Features
- **Full-Text Search** — Fast client-side search with FlexSearch
- **Dark/Light Mode** — Automatic theme adaptation with system preference detection
- **Favourites/Bookmarking** — Save and organize favourite pages and blog posts
- **Contact Forms** — Built-in form with validation
- **Mobile-First** — Responsive design optimized for all devices

## Quick Start

### Prerequisites
- Node.js 18+
- An API key for your chosen AI provider (optional, for chat features)

### Installation

1. **Clone and install:**
```bash
git clone https://github.com/coachsteff/supersite.git
cd supersite
npm install
```

2. **Set up your site:**
```bash
npm run setup
```
This creates your config (`config/site.local.yaml`) and content directory (`content-custom/`).

3. **Customize:**
   - **Branding and features**: Edit `config/site.local.yaml`
   - **Pages and content**: Edit files in `content-custom/`
   - See [Quick Start Guide](./docs/QUICKSTART.md) for details

4. **Add your API key** (optional, for AI chat):
```bash
# Create .env.local
echo 'ANTHROPIC_API_KEY=your-key-here' > .env.local
```

5. **Start developing:**
```bash
npm run dev
```

Visit http://localhost:3001

## Project Structure

```
supersite/
├── config/
│   ├── site.yaml                # Template configuration (git-tracked)
│   └── site.local.yaml          # User overrides (git-ignored)
├── app/
│   ├── api/                     # API routes (chat, config, contact, search)
│   ├── blog/                    # Blog pages
│   ├── tags/                    # Tag cloud and tag detail pages
│   ├── contact/                 # Contact page
│   ├── favourites/              # Favourites page
│   ├── [...slug]/               # Dynamic content routing
│   ├── sitemap.ts               # Auto-generated sitemap
│   ├── robots.ts                # Robots.txt with AI crawler config
│   ├── llms.txt/route.ts        # AI discoverability endpoint
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles, dark mode, visual effects
├── components/
│   ├── directives/              # 23 markdown directive components
│   │   ├── Details.tsx          # Collapsible sections
│   │   ├── Tabs.tsx             # Tabbed panels
│   │   ├── Card.tsx             # Content cards
│   │   ├── Steps.tsx            # Numbered steps
│   │   ├── Formula.tsx          # Equation layouts
│   │   ├── Flow.tsx             # Process flow diagrams
│   │   ├── InfoCard.tsx         # Capability cards
│   │   ├── Stat.tsx             # Statistics callouts
│   │   ├── Section.tsx          # Full-bleed sections
│   │   └── ...                  # + Highlight, Badge, Kbd, Abbr, etc.
│   ├── JsonLd.tsx               # JSON-LD structured data
│   ├── ThemeLoader.tsx          # Theme CSS variable injection
│   ├── Header.tsx               # Site header with navigation
│   ├── Footer.tsx               # Site footer
│   ├── MarkdownContent.tsx      # Markdown renderer with directive support
│   ├── BlogCard.tsx             # Blog post card with tag links
│   └── ...                      # Chat, Search, Navigation, etc.
├── lib/
│   ├── config.ts                # YAML config loader and validation
│   ├── markdown.ts              # Content parser, tag extraction, hashtag merging
│   ├── remarkDirectives.ts      # Remark plugin for directive AST transformation
│   ├── remark-hashtags.ts       # Remark plugin for inline hashtag processing
│   ├── seo.ts                   # SEO metadata and canonical URLs
│   ├── ai-providers.ts          # AI provider integrations
│   ├── search.ts                # FlexSearch integration
│   └── theme-system/            # Folder-based theme loader and schemas
├── themes/                      # Built-in theme templates (6 themes)
├── themes-custom/               # User custom themes (git-ignored)
├── content/                     # Template content (git-tracked)
├── content-custom/              # User content (git-ignored)
├── styles/                      # CSS modules
│   ├── Directives.module.css    # All 23 directive styles
│   ├── Tags.module.css          # Tag page styles
│   └── ...
└── docs/                        # Documentation
    ├── ARCHITECTURE.md
    ├── CONFIGURATION.md
    ├── CONTENT-MANAGEMENT.md
    ├── THEME-SYSTEM.md
    ├── UPGRADING.md
    └── ...
```

## Content Management

### Adding Pages

Create markdown files in `content-custom/pages/`. Folder structure maps to URL structure.

```yaml
---
title: "About Us"
description: "Learn about our team"
tags: ["about", "team"]
seo:
  keywords: ["about", "team"]
chat:
  priority: high
  summary: "Information about our company and team"
---

# Your content here

Use #hashtags inline and they will be auto-linked to tag pages.
```

- `content-custom/pages/about/index.md` maps to `/about`
- `content-custom/pages/services/consulting.md` maps to `/services/consulting`

### Using Directives

SuperSite supports 23 directives for rich content layouts. See [Content Management Guide](./docs/CONTENT-MANAGEMENT.md) for full reference.

```markdown
:::details{summary="Click to expand"}
Hidden content with full **markdown** support.
:::

::stat{value="23" label="Directives" color=cyan}

:highlight[Important]{color=yellow} and :badge[New]{color=green}
```

### Adding Blog Posts

Create files in `content-custom/blog/` with format: `YYYY-MM-DD-slug.md`

```yaml
---
title: "Post Title"
date: "2024-12-24"
author: "Author Name"
tags: ["AI", "Tech"]
---

# Your content with #inline #hashtags
```

## AI Chat Configuration

See [CONFIGURATION.md](./docs/CONFIGURATION.md) for complete details.

### Quick Setup

1. **Choose Provider** (edit `config/site.local.yaml`):
```yaml
chat:
  provider: "anthropic"  # anthropic | openai | gemini | ollama
  model: "claude-sonnet-4-6"
```

2. **Add API Key** (create `.env.local`):
```bash
ANTHROPIC_API_KEY=your-key-here
```

3. **Customize Behavior**:
```yaml
chat:
  systemPrompt: "You are a helpful assistant for..."
  temperature: 0.7
  button:
    position: "bottom-center"
  welcomeMessage: "Hi! How can I help?"
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Self-Hosted (Node.js + PM2 + Caddy)

1. Clone repo to server
2. Run `npm install && npm run build`
3. Start with PM2: `pm2 start npm --name supersite -- start`
4. Configure Caddy as reverse proxy to Node.js port

### Deploy to Other Platforms

Works on Netlify, Railway, Render, or any Node.js host.

## Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System architecture and design decisions
- **[CONFIGURATION.md](./docs/CONFIGURATION.md)** — Complete configuration reference
- **[CONTENT-MANAGEMENT.md](./docs/CONTENT-MANAGEMENT.md)** — Content authoring, directives, hashtags
- **[THEME-SYSTEM.md](./docs/THEME-SYSTEM.md)** — Theme system details
- **[UPGRADING.md](./docs/UPGRADING.md)** — Upgrade guide between versions
- **[QUICKSTART.md](./docs/QUICKSTART.md)** — 5-minute setup guide
- **[TESTING.md](./docs/TESTING.md)** — Testing guide
- **[ICONS.md](./docs/ICONS.md)** — Icon usage reference
- **[PRODUCTION-CHECKLIST.md](./docs/PRODUCTION-CHECKLIST.md)** — Pre-deployment checklist

## Contributing

This is a template project. Feel free to fork and customize for your needs. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License — feel free to use for personal or commercial projects.

## Troubleshooting

**Chat doesn't work:**
- Check API key in `.env.local`
- Verify `chat.enabled: true` in config
- Check browser console for errors

**Colors not updating:**
- Restart dev server after config changes
- Clear browser cache

**Build fails:**
- Run `npm install` again
- Verify Node.js version (18+)

For more help, see [CONFIGURATION.md](./docs/CONFIGURATION.md)

---

**Built with Next.js, TypeScript, and AI**
