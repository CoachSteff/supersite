# Supersite Quick Start Guide

Get your AI-powered website running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Your Configuration and Content

Run the setup command to create your user configuration and content:

```bash
npm run setup
```

This creates:
- `config/site.local.yaml` - Your configuration overrides
- `content-custom/` - Your site content

## 3. Customize Your Site

### Configuration (branding, features, etc.)

Edit `config/site.local.yaml`:

```yaml
# Only add the settings you want to change

site:
  name: "Your Site Name"          # Change this!
  description: "Your description"

branding:
  theme: "default"                # Choose: default, modern, minimal, dark, vibrant
  # OR customize specific colors:
  # overrides:
  #   colors:
  #     light:
  #       primary: "#FF6B35"

chat:
  enabled: true
  provider: "anthropic"           # Choose: anthropic, openai, gemini, or ollama
  welcomeMessage: "Hi! How can I help?"
```

**Important:** Edit `config/site.local.yaml` (not `config/site.yaml`). Your local config is gitignored and safe from updates.

### Content (pages, blog posts)

Edit your content files:
- `content-custom/pages/index.md` - Homepage
- `content-custom/pages/about/index.md` - About page
- `content-custom/blog/` - Blog posts

**Important:** Edit files in `content-custom/` (not `content/`). Your custom content is gitignored and safe from updates.

### Optional: Choose a Theme

Supersite includes 5 built-in themes. List them:

```bash
npm run setup:theme
```

To change themes, edit `config/site.local.yaml`:

```yaml
branding:
  theme: "modern"  # default, modern, minimal, dark, vibrant
```

Or create a custom theme:

```bash
cp themes/default.yaml themes-custom/my-theme.yaml
# Edit my-theme.yaml with your colors
```

```yaml
branding:
  theme: "custom/my-theme"
```

See [THEMES.md](./THEMES.md) for complete theme documentation.

## 4. Add Your AI API Key

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

## 5. Start Development Server

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

## Optional: Custom Content Path

To use a different content directory:

```yaml
# In config/site.local.yaml
content:
  customDirectory: "my-content"
```

Then run `npm run setup:content` to copy template to `my-content/`.

---

## Keeping Your Site Updated

When we release template improvements:

```bash
git pull
```

Your `config/site.local.yaml` and `content-custom/` are gitignored, so **no conflicts**!

---

For complete documentation, see:
- [README.md](../README.md) - Full overview
- [CONFIGURATION.md](./CONFIGURATION.md) - Detailed config guide
- [CONTENT-MANAGEMENT.md](./CONTENT-MANAGEMENT.md) - Content guide
- [ICONS.md](./ICONS.md) - Icon reference
