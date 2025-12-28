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
