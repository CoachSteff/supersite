# Supersite Configuration Guide

This website is fully configuration-driven through YAML files and environment variables. Everything from site branding to AI chat behavior can be customized without touching the code.

## Table of Contents

1. [Configuration Overview](#configuration-overview)
2. [Site Configuration](#site-configuration)
3. [Content Directory Configuration](#content-directory-configuration)
4. [Markdown Frontmatter](#markdown-frontmatter)
5. [Environment Variables](#environment-variables)
6. [AI Chat Configuration](#ai-chat-configuration)
7. [Branding & Styling](#branding--styling)
8. [SEO Configuration](#seo-configuration)

---

## Configuration Overview

Supersite uses a **dual-configuration system**:

- **`config/site.yaml`** - Template configuration (git-tracked, receives updates)
- **`config/site.local.yaml`** - Your overrides (git-ignored, user-owned)

The system merges both files, with your local config taking priority.

### First-Time Setup

Create your local config:

```bash
npm run setup:config
```

This creates `config/site.local.yaml` with examples.

### How It Works

1. **Template config** (`site.yaml`) provides all defaults
2. **Your config** (`site.local.yaml`) overrides specific values
3. **You only specify what you want to change**

**Example:**

```yaml
# config/site.local.yaml
# Only override what you want to change

site:
  name: "My Company"

branding:
  primaryColor: "#FF6B35"

# Everything else uses template defaults
```

### Safe Updates

When you `git pull` template updates:
- `site.yaml` gets new features and improvements
- `site.local.yaml` is gitignored (never conflicts)
- Your overrides continue working

---

## Site Configuration

The template configuration file is located at `/config/site.yaml`. You should override settings in `/config/site.local.yaml`.

### Complete Schema

```yaml
site:
  name: "Your Site Name"                    # Display name of your site
  description: "Site description"           # Brief description
  logo: "/logo.png"                         # Path to logo (in /public)
  favicon: "/favicon.ico"                   # Path to favicon
  url: "https://yoursite.com"              # Full site URL (for SEO)

branding:
  primaryColor: "#2563eb"                  # Main brand color (hex)
  secondaryColor: "#1e40af"                # Secondary brand color
  fontFamily: "Inter, sans-serif"          # Font family

seo:
  defaultTitle: "Your Site Name"           # Default page title
  titleTemplate: "%s | Your Site"          # Template for page titles
  defaultDescription: "Default desc"        # Default meta description
  ogImage: "/og-image.png"                 # Default Open Graph image
  twitterHandle: "@yourhandle"             # Twitter username (optional)

navigation:
  autoGenerate: true                       # Auto-generate nav from folders
  customLinks:                             # Additional manual links
    - title: "Blog"
      path: "/blog"
    - title: "Contact"
      path: "/contact"

chat:
  enabled: true                            # Enable/disable AI chat
  provider: "anthropic"                    # anthropic | openai | gemini | ollama
  model: "claude-3-5-sonnet-20241022"     # Model identifier
  systemPrompt: "Custom instructions"      # AI behavior instructions
  temperature: 0.7                         # Response creativity (0-1)
  maxTokens: 1024                          # Maximum response length
  button:
    position: "bottom-center"              # bottom-left | bottom-center | bottom-right
    offsetX: 0                             # Horizontal offset (pixels)
    offsetY: 20                            # Vertical offset (pixels)
    icon: "message-circle"                 # Lucide icon name
  window:
    position: "bottom-right"               # bottom-right | bottom-center | bottom-left | right-docked | bottom-docked | left-docked
    width: 400                             # Window width (pixels)
    height: 600                            # Window height (pixels)
  welcomeMessage: "Hi! How can I help?"   # Initial greeting
  placeholder: "Ask me anything..."        # Input placeholder text

features:
  search: true                             # Enable site search
  blog: true                               # Enable blog
  contactForm: true                        # Enable contact form
  analytics: false                         # Enable analytics (future)

content:
  customDirectory: "content-custom"        # User content location (override in site.local.yaml)
  templateDirectory: "content"              # Template content location (don't change)
```

### Quick Customization Examples

**Change site name and colors:**
```yaml
site:
  name: "My Company"
branding:
  primaryColor: "#FF6B35"
  secondaryColor: "#004E89"
```

**Move chat button to bottom-left:**
```yaml
chat:
  button:
    position: "bottom-left"
    offsetX: 0
    offsetY: 20
```

**Switch to OpenAI:**
```yaml
chat:
  provider: "openai"
  model: "gpt-4-turbo-preview"
```

**Chat Window Position Options:**

The chat window can appear in six different positions:

*Popup Positions* (float above content):
- `bottom-right` (default) - Appears bottom-right, 80px from bottom
- `bottom-center` - Centered at bottom, 80px from bottom
- `bottom-left` - Appears bottom-left, 80px from bottom

*Docked Positions* (attached to edge, full height/width):
- `right-docked` - Sidebar on right side, full height
- `left-docked` - Sidebar on left side, full height
- `bottom-docked` - Bar at bottom, full width

```yaml
# Examples:
chat:
  window:
    position: "right-docked"  # Sidebar on right
    width: 400
    height: 600

# or
chat:
  window:
    position: "bottom-center"  # Popup at bottom center
    width: 400
    height: 600
```

---

## Content Directory Configuration

By default, user content is stored in `content-custom/`. You can customize this path.

### Configure Custom Path

In `config/site.local.yaml`:

```yaml
content:
  customDirectory: "my-content"  # Your content directory
```

### Content Resolution Order

The system checks directories in this order:

1. **Configured custom directory** (from `content.customDirectory`)
2. **Default custom directory** (`content-custom/`)
3. **Template directory** (`content/`)

### Example: Organization-Specific Structure

```yaml
# config/site.local.yaml
content:
  customDirectory: "acme-corp-content"
```

Then:
```bash
npm run setup:content  # Copies template to acme-corp-content/
```

### Multiple Environments

Different configs for different deployments:

**Local development:**
```yaml
# config/site.local.yaml
content:
  customDirectory: "content-dev"
```

**Production:**
```yaml
# config/site.local.yaml (on production server)
content:
  customDirectory: "content-prod"
```

---

## Theme Configuration

Supersite includes a powerful multi-theme system with 5 built-in themes and support for custom themes.

### Using Built-in Themes

Choose from 5 professionally designed themes:

```yaml
# config/site.local.yaml
branding:
  theme: "default"    # Clean, professional blue theme (default)
  # OR
  theme: "modern"     # Contemporary teal/cyan theme
  # OR
  theme: "minimal"    # High-contrast black/white minimalist
  # OR
  theme: "dark"       # Purple/pink dark-first theme
  # OR
  theme: "vibrant"    # Colorful orange/green theme
```

Each theme includes:
- **Complete color palettes** for light and dark modes
- **Typography** settings (font families, sizes)
- **Spacing** scale (6 levels: xs, sm, md, lg, xl, xxl)
- **Layout** settings (border radius, max width)

### Creating a Custom Theme

**Step 1:** Copy a template theme to `themes-custom/`:

```bash
cp themes/default.yaml themes-custom/my-theme.yaml
```

**Step 2:** Customize your theme:

```yaml
# themes-custom/my-theme.yaml
name: "My Custom Theme"
description: "My brand colors and style"

colors:
  light:
    primary: "#FF6B35"
    secondary: "#004E89"
    text: "#1f2937"
    textLight: "#6b7280"
    background: "#ffffff"
    backgroundSecondary: "#f9fafb"
    border: "#e5e7eb"
    success: "#10b981"
    error: "#ef4444"
  dark:
    primary: "#ff8c5a"
    secondary: "#0066a8"
    text: "#f9fafb"
    textLight: "#d1d5db"
    background: "#111827"
    backgroundSecondary: "#1f2937"
    border: "#374151"
    success: "#34d399"
    error: "#f87171"

typography:
  fontFamily: "'Inter', -apple-system, sans-serif"
  fontFamilyMono: "'Courier New', Courier, monospace"
  baseFontSize: "16px"

spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"

layout:
  borderRadius: "8px"
  maxWidth: "1200px"
```

**Step 3:** Activate your custom theme:

```yaml
# config/site.local.yaml
branding:
  theme: "custom/my-theme"
```

### Theme Overrides

Override specific theme values without creating a full custom theme:

```yaml
# config/site.local.yaml
branding:
  theme: "default"
  overrides:
    colors:
      light:
        primary: "#FF6B35"        # Override just the primary color
        secondary: "#004E89"       # And secondary
    typography:
      fontFamily: "'Georgia', serif"  # Change font
    layout:
      borderRadius: "12px"        # More rounded corners
```

This is perfect for quick brand color changes or small tweaks.

### Theme Directory Structure

```
themes/                          # Built-in template themes (git-tracked)
├── default.yaml                # Blue professional theme
├── modern.yaml                 # Teal modern theme
├── minimal.yaml                # Black/white minimalist
├── dark.yaml                   # Purple dark-first theme
└── vibrant.yaml                # Orange colorful theme

themes-custom/                   # Your custom themes (gitignored)
└── my-theme.yaml               # Your custom theme
```

### Theme Resolution Order

When you specify a theme, the system checks in this order:

1. **Custom theme** (`themes-custom/{name}.yaml`)
2. **Template theme** (`themes/{name}.yaml`)
3. **Default fallback** (`themes/default.yaml`)

### Setup Script

List available themes and get setup instructions:

```bash
npm run setup:theme
```

### Legacy Branding Support

Old-style direct color configuration still works but is deprecated:

```yaml
# DEPRECATED (still works, but use themes instead)
branding:
  primaryColor: "#2563eb"
  secondaryColor: "#1e40af"
  fontFamily: "Inter, sans-serif"

# RECOMMENDED (use themes)
branding:
  theme: "default"
  overrides:
    colors:
      light:
        primary: "#2563eb"
        secondary: "#1e40af"
```

### Complete Theme Documentation

For detailed theme customization, color theory tips, accessibility guidelines, and examples, see:

**[Theme System Guide](THEMES.md)**

---

## Markdown Frontmatter

Every markdown file supports extended frontmatter for rich metadata.

### Page Frontmatter

**Location:** `/content/pages/**/*.md`

```yaml
---
title: "Page Title"                       # Required: page title
description: "Brief description"          # Optional: meta description
author: "Author Name"                     # Optional: content author
publishedDate: "2024-12-24"              # Optional: publish date
lastModified: "2024-12-24"               # Optional: last update date

seo:
  title: "Custom SEO Title"              # Optional: override page title for SEO
  description: "Custom SEO description"   # Optional: override description
  keywords: ["AI", "Tech", "Innovation"]  # Optional: meta keywords
  noindex: false                          # Optional: prevent indexing

chat:
  priority: high                          # high | medium | low
  summary: "Brief content summary"        # Used in AI context

custom:
  featured: true                          # Any custom fields
  category: "Technology"
---
```

### Blog Post Frontmatter

**Location:** `/content/blog/*.md`

```yaml
---
title: "Blog Post Title"                  # Required
date: "2024-12-24"                       # Required: publish date
author: "Author Name"                     # Optional
description: "Post summary"               # Optional
tags: ["AI", "Technology", "News"]       # Optional: post tags

seo:
  title: "Custom SEO Title"              # Optional
  description: "Custom description"       # Optional
  keywords: ["AI", "Blog"]               # Optional
  noindex: false                          # Optional

chat:
  priority: medium                        # high | medium | low
  summary: "Brief post summary"          # Used in AI context

custom:
  featured: false
  readTime: "5 min"
---
```

### Priority Levels

The `chat.priority` field determines content importance for AI context:

- **high**: Always included in AI context (homepage, about, key services)
- **medium**: Included when relevant (blog posts, secondary pages)
- **low**: Included only if high-priority content is limited (archives, old posts)

### SEO Best Practices

1. **Always set title and description** for every page
2. **Use keywords sparingly** (3-5 relevant terms)
3. **Keep descriptions under 160 characters**
4. **Set `noindex: true`** for private/draft pages
5. **Use `chat.summary`** to help AI understand page context

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this file!):

```bash
# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI (GPT)
OPENAI_API_KEY=sk-your-key-here

# Google Gemini
GEMINI_API_KEY=your-key-here

# Ollama (local, if using)
OLLAMA_BASE_URL=http://localhost:11434
```

### Getting API Keys

**Anthropic (Claude):**
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new key

**OpenAI (GPT):**
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys
4. Create a new secret key

**Google Gemini:**
1. Visit https://makersuite.google.com/
2. Sign up or log in
3. Get API key from settings

**Ollama (Local):**
1. Install Ollama from https://ollama.ai/
2. Run `ollama serve` to start the server
3. Pull a model: `ollama pull llama2`
4. Set `OLLAMA_BASE_URL` in `.env.local`

---

## AI Chat Configuration

### Choosing a Provider

Edit `config/site.yaml`:

```yaml
chat:
  provider: "anthropic"  # Choose: anthropic | openai | gemini | ollama
  model: "model-name"
```

### Recommended Models

**Anthropic:**
- `claude-3-5-sonnet-20241022` (recommended, balanced)
- `claude-3-opus-20240229` (most capable, slower)
- `claude-3-haiku-20240307` (fastest, cheaper)

**OpenAI:**
- `gpt-4-turbo-preview` (recommended)
- `gpt-4` (most capable)
- `gpt-3.5-turbo` (faster, cheaper)

**Google Gemini:**
- `gemini-pro` (recommended)
- `gemini-pro-vision` (with images)

**Ollama (Local):**
- `llama2` (general purpose)
- `mistral` (fast, good quality)
- `codellama` (code-focused)

### System Prompt Guidelines

The `systemPrompt` instructs the AI on how to behave:

```yaml
chat:
  systemPrompt: |
    You are a helpful assistant for [Your Company] website.
    Answer questions based on the provided context.
    Be concise, friendly, and professional.
    If you don't know something, say so honestly.
    Always cite relevant pages when possible.
```

### Temperature & Token Settings

```yaml
chat:
  temperature: 0.7    # 0 = focused, 1 = creative
  maxTokens: 1024     # Response length limit
```

- **Low temperature (0-0.3):** Factual, consistent answers
- **Medium temperature (0.4-0.7):** Balanced creativity and accuracy
- **High temperature (0.8-1.0):** More creative, varied responses

---

## Branding & Styling

### Color Customization

Colors are applied via CSS variables from `config/site.yaml`:

```yaml
branding:
  primaryColor: "#2563eb"      # Buttons, links, accents
  secondaryColor: "#1e40af"    # Hover states, secondary elements
  fontFamily: "Inter, sans-serif"
```

### Using Custom Fonts

**Option 1: Google Fonts**

1. Add to `app/layout.tsx` in the `<head>`:
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

2. Update `config/site.yaml`:
```yaml
branding:
  fontFamily: "'Inter', sans-serif"
```

**Option 2: Local Fonts**

1. Place font files in `/public/fonts/`
2. Add `@font-face` rules to `app/globals.css`
3. Update config with font family name

### Logo Customization

1. Place logo image in `/public/` (e.g., `/public/logo.png`)
2. Update `config/site.yaml`:
```yaml
site:
  logo: "/logo.png"
```

3. Optionally update `components/Header.tsx` to use image instead of text

---

## SEO Configuration

### Global SEO Settings

Set defaults in `config/site.yaml`:

```yaml
seo:
  defaultTitle: "My Site"
  titleTemplate: "%s | My Site"           # %s replaced with page title
  defaultDescription: "Welcome to my site"
  ogImage: "/og-image.png"                # 1200x630px recommended
  twitterHandle: "@myhandle"
```

### Page-Specific SEO

Override in markdown frontmatter:

```yaml
seo:
  title: "Custom Page Title"
  description: "Custom description under 160 chars"
  keywords: ["keyword1", "keyword2"]
  noindex: false
```

### Open Graph Images

1. Create image (1200x630px recommended)
2. Save to `/public/og-image.png`
3. Update config or frontmatter:

**Global:**
```yaml
seo:
  ogImage: "/og-image.png"
```

**Per-page:** (future enhancement)

### Robots.txt & Sitemap

**Block indexing of specific pages:**
```yaml
seo:
  noindex: true
```

---

## Tips & Best Practices

### Content Organization

```
content/
  pages/
    index.md              # Homepage (priority: high)
    about/
      index.md            # About page (priority: high)
    services/
      index.md            # Services overview (priority: high)
      consulting.md       # Service detail (priority: medium)
  blog/
    2024-12-24-post.md   # Recent posts (priority: medium)
    2024-01-01-old.md    # Old posts (priority: low)
```

### Chat Priority Strategy

- **High priority:** Core pages users ask about (10-15 pages max)
- **Medium priority:** Supporting content and recent blog posts
- **Low priority:** Archives, old content, supplementary pages

### Configuration Validation

The site will fail to start if configuration is invalid. Common issues:

1. **Invalid YAML syntax:** Use a YAML validator
2. **Missing required fields:** Check schema in this guide
3. **Invalid enum values:** Use exactly the values shown (case-sensitive)
4. **Missing API keys:** AI chat won't work without valid keys

### Hot Reload

Changes to `config/site.yaml` require a server restart:
```bash
npm run dev
```

Markdown content changes are reflected immediately.

---

## Troubleshooting

**Chat button doesn't appear:**
- Check `chat.enabled: true` in config
- Verify ChatButton is in layout
- Check browser console for errors

**AI responses fail:**
- Verify API key in `.env.local`
- Check provider name matches exactly
- Ensure model name is correct
- Check API key has sufficient credits

**Colors not applying:**
- Restart dev server after config changes
- Check color format is valid hex (#RRGGBB)
- Inspect element in browser to verify CSS variables

**SEO metadata not showing:**
- Check frontmatter YAML syntax
- Verify metadata is in `<head>` (view page source)
- Wait for crawlers to re-index

---

## Example Configurations

### Simple Blog

```yaml
site:
  name: "My Blog"
branding:
  primaryColor: "#6366f1"
chat:
  enabled: true
  welcomeMessage: "Ask me about any blog post!"
features:
  search: true
  blog: true
  contactForm: false
```

### Company Website

```yaml
site:
  name: "Acme Corp"
branding:
  primaryColor: "#0070f3"
chat:
  enabled: true
  systemPrompt: "You represent Acme Corp. Be professional and helpful."
  button:
    position: "bottom-right"
features:
  search: true
  blog: true
  contactForm: true
```

### Documentation Site

```yaml
site:
  name: "Product Docs"
branding:
  primaryColor: "#10b981"
chat:
  enabled: true
  systemPrompt: "Help users find documentation. Cite page references."
  model: "claude-3-5-sonnet-20241022"
features:
  search: true
  blog: false
  contactForm: false
```
