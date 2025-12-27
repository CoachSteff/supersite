# Supersite

> A universal, AI-powered website template built with Next.js

**Part of the Super family:** [superskills](https://github.com/coachsteff/superskills)

---

## What is Supersite?

Supersite is a production-ready, AI-native website template that combines the simplicity of markdown content management with the power of intelligent AI chat. Configure everything through YAML, manage content with markdown files, and deploy anywhere.

## Quick Links

- **GitHub:** https://github.com/coachsteff/supersite
- **Documentation:** [README.md](./README.md)
- **Configuration Guide:** [CONFIGURATION.md](./CONFIGURATION.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)

## Core Features

### 🤖 AI-Powered
- Multi-provider support (Anthropic, OpenAI, Gemini, Ollama)
- Context-aware responses using your content
- Configurable positioning and behavior
- Page action buttons (Copy, Star, Share)

### ⚙️ Configuration-Driven
- Single YAML file for all settings
- No code changes needed for customization
- Type-safe with Zod validation
- Hot reload on config changes

### 📝 Content-First
- Markdown-based pages and blog
- Extended frontmatter metadata
- Auto-generated navigation from folder structure
- SEO-optimized out of the box

### 🎨 Modern & Responsive
- Mobile-first design
- Automatic dark/light mode
- Icon library (Lucide React)
- Full-text search
- Contact forms

## Tech Stack

- **Framework:** Next.js 14.2+ (App Router, TypeScript)
- **Styling:** Plain CSS with CSS modules
- **AI SDKs:** Anthropic, OpenAI, Gemini, Ollama
- **Content:** Markdown with gray-matter
- **Search:** FlexSearch (client-side)
- **Icons:** Lucide React
- **Validation:** Zod

## Project Structure

```
supersite/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── config/           # YAML configuration
├── content/          # Markdown content (pages & blog)
├── lib/              # Utilities & business logic
└── styles/           # CSS modules
```

## Key Components

### AI Chat System
- **ChatProvider.tsx** - State management
- **ChatButton.tsx** - Floating button
- **ChatWindow.tsx** - Chat interface
- **ai-providers.ts** - Multi-provider abstraction
- **context-builder.ts** - Content indexing for AI

### Page Actions
- **PageActions.tsx** - Copy, Star, Share buttons
- **SharePopup.tsx** - Social sharing modal
- **favorites.ts** - localStorage favorites

### Content Management
- **markdown.ts** - Parsing & processing
- **search.ts** - Full-text search
- **seo.ts** - Metadata generation

## Recent Updates

✅ **Page Action Buttons** (2024-12-24)
- Copy page as markdown
- Star/favorite pages (localStorage)
- Share popup (Link, X, LinkedIn, Email)
- Mobile-responsive design

✅ **Chat Positioning** (2024-12-24)
- 6 position options (3 popup, 3 docked)
- Mobile-adaptive layouts
- Configurable via YAML

## Use Cases

Perfect for:
- Company websites with AI assistant
- Documentation sites with smart search
- Knowledge bases with conversational interface
- Blogs with AI content helper
- Product sites with interactive Q&A
- Portfolios with intelligent navigation

## Getting Started

```bash
git clone https://github.com/coachsteff/supersite.git
cd supersite
npm install
cp .env.example .env.local  # Add your API keys
npm run dev
```

Visit http://localhost:3000

## Configuration

Edit `config/site.yaml`:

```yaml
site:
  name: "Your Site"
  url: "https://yoursite.com"

branding:
  primaryColor: "#2563eb"
  secondaryColor: "#1e40af"

chat:
  enabled: true
  provider: "anthropic"
  model: "claude-3-5-sonnet-20241022"
```

Add `.env.local`:

```bash
ANTHROPIC_API_KEY=your-key-here
```

See [CONFIGURATION.md](./CONFIGURATION.md) for complete options.

## Deployment

- **Vercel** (recommended) - Zero config
- **Netlify** - Works great
- **Railway/Render** - Any Node.js host
- **Static Export** - Add `output: 'export'` to next.config.js

## What Makes Supersite Special?

✅ **True Configuration-Driven** - Change everything via YAML  
✅ **AI-Native** - Built-in AI chat, not an afterthought  
✅ **Multi-Provider** - Never locked into one AI service  
✅ **Content-First** - Markdown everywhere, no database  
✅ **Production-Ready** - SEO, dark mode, responsive, fast  
✅ **Developer-Friendly** - TypeScript, modular, documented  
✅ **Universal Template** - Clone once, use for any site  

## License

MIT License - Free for personal and commercial use

## Support

- 📖 Read the [full documentation](./README.md)
- ⚙️ Check [configuration guide](./CONFIGURATION.md)
- 🚀 Follow [quick start](./QUICKSTART.md)

---

**Built with ❤️ by [Steff Van Haverbeke](https://github.com/coachsteff)**
