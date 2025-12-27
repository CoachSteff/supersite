# Supersite Quick Start Guide

Get your AI-powered website running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Your Site

Edit `config/site.yaml`:

```yaml
site:
  name: "Your Site Name"          # Change this!
  description: "Your description"
  url: "https://yoursite.com"

branding:
  primaryColor: "#2563eb"         # Your brand color
  secondaryColor: "#1e40af"

chat:
  enabled: true
  provider: "anthropic"           # Choose: anthropic, openai, gemini, or ollama
  welcomeMessage: "Hi! How can I help?"
```

## 3. Add Your AI API Key

Create `.env.local` in the project root:

```bash
# For Anthropic Claude (recommended)
ANTHROPIC_API_KEY=your-key-here

# OR for OpenAI
# OPENAI_API_KEY=your-key-here

# OR for Google Gemini
# GEMINI_API_KEY=your-key-here

# OR for Ollama (local)
# OLLAMA_BASE_URL=http://localhost:11434
```

**Get API keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/
- Google: https://makersuite.google.com/
- Ollama: https://ollama.ai/ (free, local)

## 4. Add Your Content

Replace the sample content in:

- `content/pages/index.md` - Homepage
- `content/pages/about/index.md` - About page
- `content/blog/` - Blog posts

**Page template:**
```yaml
---
title: "Page Title"
description: "Brief description"
chat:
  priority: high
  summary: "What this page is about"
---

# Your content here

Write your markdown content normally!
```

**Blog post template:**
```yaml
---
title: "Post Title"
date: "2024-12-24"
author: "Your Name"
tags: ["AI", "Technology"]
chat:
  priority: medium
  summary: "What this post covers"
---

# Your post content
```

## 5. Run It!

```bash
npm run dev
```

Visit http://localhost:3000

## 6. Test the Chat

1. Click the chat button (bottom center)
2. Ask: "What services do you offer?"
3. The AI will answer based on your content!

## Next Steps

- **Customize branding**: Edit colors in `config/site.yaml`
- **Add your logo**: Place in `/public/` and update config
- **Configure SEO**: Add metadata in `config/site.yaml`
- **Read full docs**: See [CONFIGURATION.md](./CONFIGURATION.md)

## Common Issues

**Chat doesn't work:**
- Make sure you added API key to `.env.local`
- Restart dev server after creating `.env.local`
- Check `chat.enabled: true` in config

**Build fails:**
- Run `npm install` again
- Check Node.js version: `node --version` (needs 18+)

**Content doesn't show:**
- Check markdown file structure
- Verify frontmatter YAML is valid
- Restart dev server

## Deploy to Vercel

1. Push to GitHub
2. Go to https://vercel.com/
3. Import your repository
4. Add environment variables (API keys)
5. Deploy!

---

That's it! You now have a fully functional AI-powered website. 🎉

For complete documentation, see:
- [README.md](./README.md) - Full overview
- [CONFIGURATION.md](./CONFIGURATION.md) - Detailed config guide
- [ICONS.md](./ICONS.md) - Icon reference
