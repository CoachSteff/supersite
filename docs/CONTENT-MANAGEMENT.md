# Content Management Guide

## Overview

Supersite uses:
- **Dual-config system** for settings (`site.yaml` ← `site.local.yaml`)
- **Dual-directory system** for content (template vs. user)

## Configuration Structure

```
config/
├── site.yaml          # Template config (git-tracked, receives updates)
└── site.local.yaml    # Your overrides (gitignored, safe from conflicts)
```

## Content Structure

```
content/               # Template content (git-tracked)
├── pages/
└── blog/

content-custom/        # Your content (gitignored, customizable path)
├── pages/
└── blog/
```

## First-Time Setup

```bash
npm run setup              # Setup both config and content
# OR separately:
npm run setup:config       # Just config
npm run setup:content      # Just content
```

## Customizing Content Path

### Option 1: Use Default

By default, user content goes to `content-custom/`. No configuration needed.

### Option 2: Custom Path

In `config/site.local.yaml`:

```yaml
content:
  customDirectory: "my-site-content"
```

Then run:
```bash
npm run setup:content  # Copies template to my-site-content/
```

### Option 3: Different Paths Per Environment

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

## How It Works

### Config Merging

1. Load `config/site.yaml` (template defaults)
2. Load `config/site.local.yaml` (your overrides)
3. Merge: template ← user overrides
4. User values take priority

### Content Resolution

1. Check configured custom directory (from config)
2. Fall back to `content-custom/` (default)
3. Fall back to `content/` (template)

## Example Workflows

### Workflow 1: Simple (Default)

```bash
npm run setup                           # Creates config + content-custom/
code config/site.local.yaml             # Customize branding
code content-custom/pages/index.md      # Edit homepage
npm run dev                             # Preview
```

### Workflow 2: Custom Content Path

```bash
npm run setup:config                    # Create config

# Configure custom path
cat >> config/site.local.yaml << EOF
content:
  customDirectory: "acme-content"
EOF

npm run setup:content                   # Creates acme-content/
code acme-content/pages/index.md        # Edit content
npm run dev                             # Preview
```

### Workflow 3: Git Pull Updates

```bash
git pull                                # Get template updates
# config/site.yaml updated (new features)
# content/ updated (new demo content)
# YOUR config/site.local.yaml untouched
# YOUR content-custom/ untouched

npm run dev                             # Your site works with new features
```

## Markdown Directives

SuperSite extends standard markdown with custom directives for rich content layouts. Directives come in three types based on their syntax.

### Container Directives (`:::name`)

Wrap content blocks. Close with `:::`.

**Collapsible section:**
```markdown
:::details{summary="Click to expand"}
Hidden content with full **markdown** support.
:::
```

**Tabbed content** (note: outer fence needs MORE colons than inner):
```markdown
::::tabs
:::tab{label="Overview"}
First tab content.
:::
:::tab{label="Details"}
Second tab content.
:::
::::
```

**Content card** (first image becomes header, first heading becomes title):
```markdown
:::card
![Photo](/images/photo.jpg)
### Card Title
Card body text.
:::
```

**Numbered steps** (splits on `###` headings):
```markdown
:::steps
### Step One
Do this first.

### Step Two
Then do this.
:::
```

**Other containers:** `:::image-grid{columns=3}`, `:::carousel`, `:::columns{count=2}`, `:::callout{type=tip}`, `:::figure`

### Leaf Directives (`::name`)

Single-line, no content body.

```markdown
::youtube{id=dQw4w9WgXcQ}
::button{href=/contact label="Get in touch" variant=primary}
::spacer{size=lg}
::divider{style=dots}
```

- **youtube** — Responsive 16:9 embed. Only needs `id`.
- **button** — Styled CTA. Variants: `primary`, `secondary`, `outline`.
- **spacer** — Vertical whitespace. Sizes: `sm`, `md`, `lg`, `xl`.
- **divider** — Decorative break. Styles: `dots`, `wave`, `gradient`, `fade`.

### Text/Inline Directives (`:name[content]{attrs}`)

Inline within paragraphs.

```markdown
This has :highlight[important text]{color=yellow} and a :badge[New]{color=green} badge.

Press :kbd[Ctrl+S] to save.

The :abbr[CAF]{title="Cognitive Agility Framework"} defines five capabilities.
```

- **highlight** — Colored background. Colors: `yellow`, `green`, `blue`, `pink`, `orange`.
- **badge** — Status pill. Colors: `primary`, `green`, `red`, `yellow`, `purple`.
- **kbd** — Keyboard key styling. Compound shortcuts like `Ctrl+S` auto-split.
- **abbr** — Click to show popup with definition. Uses `title` attribute.

### Infographic Directives

For data visualization and presentation layouts.

**Formula layout** (equation-style with operator symbols):
```markdown
:::formula
:::formula-card{accent=cyan badge="Input"}
### Data
Raw information
:::
:::formula-card{accent=teal badge="Process"}
### Analysis
Pattern recognition
:::
:::formula-card{accent=green badge="Output"}
### Insight
Actionable knowledge
:::
:::
```

**Flow diagram** (process steps with directional arrows):
```markdown
:::flow
:::flow-step
### Collect
Gather requirements
:::
:::flow-step
### Build
Develop solution
:::
:::flow-step
### Ship
Deploy to production
:::
:::
```

**Info card** (numbered capability card with accent and hashtag pills):
```markdown
:::info-card{number=1 accent=cyan badge="Core" subtitle="Foundation skill"}
### Flexible Thinking
The ability to shift perspectives and adapt approaches. #cognition #adaptability
:::
```

**Statistics callout:**
```markdown
:::stat{value="23" color="cyan" icon="hash"}
Markdown directives available out of the box.
:::

:::stat{value="99%" color="green" icon="gauge"}
Lighthouse performance score.
:::
```
The `icon` attribute accepts any [Lucide icon](https://lucide.dev/icons/) name in kebab-case (e.g., `clock`, `users`, `trending-up`, `linkedin`). Icons render as 28px outline strokes above the value.

**Concept connector** (maps two ideas with an arrow):
```markdown
::connector{from="Old Approach" to="New Approach" color=teal}
```

**Full-bleed section** (background variant for page structure):
```markdown
:::section{variant=dark}
Content with dark background spanning full width.
:::
```

Available accent colors: `cyan`, `teal`, `green`, `orange`, `yellow`, `purple`, `red`, `blue`, `pink`.

### Directive Tips

- Nested containers require the outer fence to have more colons than inner ones (e.g., `::::tabs` wrapping `:::tab`)
- All directives work in both light and dark mode via theme CSS variables
- See `/test-directives` for live examples of every directive
- Directives can be combined: cards inside columns, highlights inside callouts, etc.

## Hashtags and Tags

SuperSite supports inline hashtags that automatically become linked tags.

### Using Hashtags

Write `#TagName` anywhere in your markdown body text:

```markdown
This post covers #AI and #MachineLearning techniques for #ProductivityBoost.
```

Each hashtag is transformed into a clickable link to the corresponding tag page (`/tags/ai`, `/tags/machine-learning`, etc.).

### How Tags Work

Tags come from two sources that are automatically merged:

1. **Frontmatter tags** — explicit tag list in YAML header:
   ```yaml
   ---
   tags: ["AI", "Machine Learning"]
   ---
   ```

2. **Inline hashtags** — `#TagName` in body text

Both sources are normalized (lowercased, kebab-cased) and deduplicated. For example, a frontmatter tag `"Machine Learning"` and an inline `#MachineLearning` resolve to the same tag: `machine-learning`.

### Where Hashtags Are Skipped

The hashtag plugin will not transform `#` in these contexts:
- Headings (`# Heading` is not a tag)
- Code blocks and inline code
- Inside existing links
- HTML blocks

### Tag Pages

- `/tags` — Tag cloud showing all tags with post counts
- `/tags/{tag}` — Lists all content tagged with that tag

### Inside Info Cards

Hashtags inside `:::info-card` directives are contextually restyled as compact pills rather than standard inline links.

## Blog Post Naming

Blog posts use date-based naming:

```
content-custom/blog/YYYY-MM-DD-title.md

Examples:
- 2024-12-25-welcome.md
- 2024-12-26-my-first-post.md
```

## Frontmatter

All content files require frontmatter:

```markdown
---
title: Page Title
description: Page description
author: Author Name
publishedDate: "2024-12-25"
seo:
  title: "SEO Title"
  description: "SEO description"
  keywords: ["keyword1", "keyword2"]
chat:
  priority: high
  summary: "Summary for AI chat context"
---

# Your Content Here
```

## FAQ

**Q: Can I delete `content/` after setup?**
A: No, keep it. It's your template reference and receives updates.

**Q: What if I want to start fresh?**
A: Delete `content-custom/` and run `npm run setup:content` again.

**Q: Can I version control my content separately?**
A: Yes! Initialize a separate git repo in `content-custom/` if desired.

**Q: What happens if I edit `content/`?**
A: Those edits will conflict on `git pull`. Always edit `content-custom/`.

**Q: Do I need to configure a custom content path?**
A: No. Default `content-custom/` works great. Only customize if you need a specific structure.

**Q: Can I rename site.local.yaml?**
A: Not without code changes. The loader looks for exactly `site.local.yaml`.

**Q: Can I have multiple content directories?**
A: Not currently. The system uses one custom directory at a time.

**Q: What happens if my configured path doesn't exist?**
A: The system falls back to `content-custom/`, then `content/`, and logs a warning.

## Content Organization Best Practices

### Pages

- Homepage: `content-custom/pages/index.md`
- About: `content-custom/pages/about/index.md`
- Services: `content-custom/pages/services/index.md`
- Nested pages: Use folders for URL structure

### Blog Posts

- Use date prefix: `2024-12-25-post-title.md`
- Add tags for categorization
- Set `chat.priority` based on importance
- Include descriptive `chat.summary` for AI context

### Images and Assets

Place in `/public` directory:
- `/public/images/` for content images
- Reference in markdown: `![Alt text](/images/photo.jpg)`

## Template Updates

When you pull template updates:

```bash
git pull
```

### What Gets Updated

✅ `config/site.yaml` - New configuration options
✅ `content/` - Improved demo content
✅ Code and features

### What Stays Yours

🔒 `config/site.local.yaml` - Your config overrides
🔒 `content-custom/` - Your content
🔒 `.env.local` - Your API keys

**No conflicts, ever!**
