# SuperSite Theme System

## Filosofie

**Eenvoud boven alles.** Een theme is een verzameling configuratiebestanden die samen bepalen hoe je site eruitziet en werkt. Geen inheritance, geen magie - gewoon YAML files die je kunt kopiëren en aanpassen.

## Wat is een Theme?

Een theme bevat drie config-lagen:

```
themes/
└── blog/
    ├── theme.yaml       # Metadata + feature toggles
    ├── structure.yaml   # Layout structuur (header, footer, sidebar)
    ├── blocks.yaml      # Content blocks en widgets
    └── colors.yaml      # Kleuren, fonts, spacing
```

**Dat is het.** Vier YAML bestanden. Kopieer een theme folder, pas de YAML aan, klaar.

## Directory Structure

```
supersite/
├── themes/                       # Standaard themes
│   ├── base/
│   ├── blog/
│   ├── influencer/
│   ├── business/
│   ├── community/
│   └── chatbot/
├── themes-custom/                # Gebruiker themes (git-ignored)
│   └── my-theme/
└── config/
    └── site.yaml                 # Verwijst naar gekozen theme
```

## De 6 Standaard Themes

### 1. Base
Algemeen startpunt met alle standaard features.
- Header met navigatie
- Main content area
- Footer
- AI chat
- Search

### 2. Blog
Content-first voor schrijvers en publishers.
- Featured post hero
- Content stream met sidebar
- Categories, tags, recent posts
- Reading time, table of contents
- Subscribe/newsletter focus

### 3. Influencer
Personal branding, link-in-bio stijl.
- Profiel foto + bio bovenaan
- Centered link cards
- Social icons prominent
- Booking/contact integratie
- Minimale navigatie

### 4. Business
Conversie-gericht voor producten en diensten.
- Hero met value proposition + CTA
- Feature sections
- Testimonials
- Pricing tables
- Contact formulier

### 5. Community
Learning en engagement platform.
- Member login/registratie
- Course/content library
- Discussion threads
- Member profielen
- Progress tracking

### 6. Chatbot
AI-first conversatie interface.
- Full-screen chat
- Conversation history
- User login voor history
- Presets/templates
- Voice input

## Config Files

### theme.yaml
```yaml
name: "Blog"
description: "Content-first blog theme"
version: "1.0.0"
author: "SuperSite"

# Feature toggles
features:
  search: true
  chat: true
  darkMode: true
  auth: false           # User login/registratie
  newsletter: true
  comments: false
  socialShare: true

# Blog-specific features
blog:
  readingTime: true
  tableOfContents: true
  relatedPosts: true

# Default color scheme file
defaultColors: "colors.yaml"
```

### structure.yaml
```yaml
# Header
header:
  enabled: true
  style: "minimal"          # full | minimal | centered | none
  sticky: true
  logo: true
  search: true
  themeToggle: true
  auth: false               # Login/profile button

# Navigation
navigation:
  style: "horizontal"       # horizontal | vertical | hamburger | none
  position: "header"        # header | sidebar | footer

# Layout
layout:
  type: "sidebar-right"     # full-width | centered | sidebar-left | sidebar-right
  maxWidth: "1400px"
  contentWidth: "800px"
  sidebarWidth: "300px"

# Hero
hero:
  enabled: true
  type: "featured-post"     # none | text | image | featured-post | profile | chat
  height: "auto"

# Footer
footer:
  enabled: true
  style: "minimal"          # full | minimal | centered | none
```

### blocks.yaml
```yaml
# Sidebar widgets (if sidebar enabled)
sidebar:
  - type: "search"
  - type: "about"
    title: "About"
    content: "Short bio here"
  - type: "categories"
  - type: "tags"
    limit: 20
  - type: "recent-posts"
    limit: 5
  - type: "newsletter"
    title: "Subscribe"
    placeholder: "your@email.com"

# Homepage sections (for business/landing pages)
sections: []

# Footer widgets
footerWidgets:
  - type: "copyright"
  - type: "social-links"
```

### colors.yaml
```yaml
name: "Blog Light"

colors:
  light:
    primary: "#2563eb"
    secondary: "#1e40af"
    text: "#1f2937"
    textLight: "#6b7280"
    background: "#ffffff"
    backgroundSecondary: "#f9fafb"
    border: "#e5e7eb"
    success: "#10b981"
    error: "#ef4444"
  dark:
    primary: "#60a5fa"
    secondary: "#93c5fd"
    text: "#f9fafb"
    textLight: "#d1d5db"
    background: "#111827"
    backgroundSecondary: "#1f2937"
    border: "#374151"
    success: "#34d399"
    error: "#f87171"

typography:
  fontFamily: "Inter, system-ui, sans-serif"
  fontFamilyMono: "JetBrains Mono, monospace"
  baseFontSize: "16px"

spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"

borderRadius: "8px"
```

## User Authentication (File-based)

Voor community en chatbot themes: simpele file-based auth.

```
data/
└── users/
    ├── index.json           # User lookup (email -> id)
    └── {user-id}.json       # User profile + hashed password
```

Features:
- Email + password registratie
- Session via signed cookies (geen DB)
- Password reset via email
- Profile editing
- Optional: social login (later)

## Site Configuration

In `config/site.yaml`:

```yaml
site:
  name: "My Blog"
  url: "https://myblog.com"

# Theme selection - that's it!
theme: "blog"

# Or custom theme
theme: "custom/my-theme"

# Optional: override specific settings without touching theme
overrides:
  features:
    comments: true
  colors:
    light:
      primary: "#10b981"
```

## Een Custom Theme Maken

1. Kopieer een bestaand theme:
   ```bash
   cp -r themes/blog themes-custom/my-blog
   ```

2. Pas de YAML files aan naar wens

3. Update `site.yaml`:
   ```yaml
   theme: "custom/my-blog"
   ```

4. Refresh je site

Klaar. Geen code, geen builds, gewoon YAML.

## Implementation Priority

### Phase 1: Theme Loader
- [ ] Theme schema (Zod validation)
- [ ] Multi-file theme loader
- [ ] Site.yaml theme selection

### Phase 2: Structure Rendering
- [ ] Layout types (full-width, sidebar, centered)
- [ ] Header styles
- [ ] Hero types
- [ ] Footer styles

### Phase 3: Blocks System
- [ ] Sidebar widgets
- [ ] Section blocks (for business)
- [ ] Footer widgets

### Phase 4: User Authentication
- [ ] File-based user storage
- [ ] Registration/login
- [ ] Session management
- [ ] Password reset

### Phase 5: All Themes
- [ ] Blog theme
- [ ] Influencer theme
- [ ] Business theme
- [ ] Community theme
- [ ] Chatbot theme

---

*Eenvoud is de ultieme verfijning.*
