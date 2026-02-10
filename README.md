# SuperSite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)

> 🎉 **Version 0.2.0** - Production-ready with AI-first features

A universal, AI-powered website template built with Next.js. Fully configuration-driven through YAML files and markdown content. Features an intelligent AI chat assistant that answers questions about your site content.

Part of the **Super** family: [superskills](https://github.com/coachsteff/superskills)

📖 **[Read the Release Notes](./RELEASE_NOTES.md)** | 🚀 **[Quick Start Guide](./QUICKSTART.md)** | 📚 **[Full Documentation](./CONFIGURATION.md)**

## ✨ Key Features

### AI-Powered
- **Intelligent Chat Assistant**: AI chatbot that understands your site content
- **Multi-Provider Support**: Switch between Anthropic Claude, OpenAI GPT, Google Gemini, or local Ollama
- **Multilingual Support**: Automatically detects and responds in user's language (17 languages supported)
- **Context-Aware**: Automatically uses your markdown content to answer questions
- **Configurable Behavior**: Customize AI personality and behavior via YAML

### User Experience
- **Favourites/Bookmarking**: Save and organize favourite pages and blog posts
- **Multi-language Ready**: 17 languages with automatic detection and AI translation
- **Language Switcher**: Easy language selection with flag icons
- **Loading States**: Smooth transitions and progress indicators
- **Translation Caching**: Fast performance with intelligent content caching

### Configuration-Driven
- **YAML Configuration**: All settings in one file (`config/site.yaml`)
- **No Code Changes**: Customize branding, features, and AI without touching code
- **Extended Frontmatter**: Rich metadata in markdown files
- **Hot Reload**: Configuration changes take effect immediately

### Content Management
- **Markdown-Based**: All content in simple markdown files
- **Auto-Generated Navigation**: Menu builds from folder structure
- **Blog System**: Date-based posts with tags and metadata
- **SEO-Optimized**: Automatic meta tags and structured data

### Modern Features
- **Full-Text Search**: Fast client-side search with icons
- **Dark/Light Mode**: Automatic theme adaptation
- **Mobile-First**: Responsive design optimized for all devices
- **Icon Library**: Lucide React for clean, minimal UI
- **Contact Forms**: Built-in form with validation

### Theming
- **5 Built-in Themes**: Choose from professional, modern, minimal, dark, or vibrant themes
- **Custom Themes**: Create your own themes with YAML configuration
- **Theme Overrides**: Fine-tune specific values without creating a full theme
- **Automatic Dark Mode**: All themes include light and dark variants
- **CSS Custom Properties**: Dynamic styling via CSS variables

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- An API key for your chosen AI provider

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
This creates your config (`config/site.local.yaml`) and content (`content-custom/`).

3. **Customize:**
   - **Branding & features**: Edit `config/site.local.yaml`
   - **Pages & content**: Edit files in `content-custom/`
   - See [Quick Start Guide](./docs/QUICKSTART.md) for details

4. **Add your API key:**

Create `.env.local`:
```bash
ANTHROPIC_API_KEY=your-key-here
```

5. **Start developing:**
```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
supersite/
├── config/
│   └── site.yaml             # Main configuration file
├── app/
│   ├── api/
│   │   ├── chat/             # AI chat endpoint
│   │   ├── config/           # Configuration API
│   │   ├── contact/          # Contact form
│   │   ├── navigation/       # Navigation data
│   │   └── search/           # Search endpoint
│   ├── blog/                 # Blog pages
│   ├── contact/              # Contact page
│   ├── [...slug]/            # Dynamic routing
│   ├── layout.tsx            # Root layout with chat
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles + dark mode
├── components/
│   ├── ChatProvider.tsx      # Chat state management
│   ├── ChatButton.tsx        # Floating chat button
│   ├── ChatWindow.tsx        # Chat interface
│   ├── ChatMessage.tsx       # Message display
│   ├── ThemeLoader.tsx       # Dynamic branding
│   ├── Header.tsx            # Site header
│   ├── Footer.tsx            # Site footer
│   ├── Navigation.tsx        # Auto-generated nav
│   ├── Search.tsx            # Search modal
│   ├── ContactForm.tsx       # Contact form
│   ├── BlogCard.tsx          # Blog post card
│   └── MarkdownContent.tsx   # Markdown renderer
├── content/
│   ├── pages/                # Site pages (markdown)
│   │   ├── index.md          # Homepage
│   │   ├── about/index.md
│   │   └── services/index.md
│   └── blog/                 # Blog posts (markdown)
│       └── YYYY-MM-DD-slug.md
├── lib/
│   ├── config.ts             # YAML parser & validation
│   ├── ai-providers.ts       # AI provider abstraction
│   ├── context-builder.ts    # Build AI context
│   ├── markdown.ts           # Markdown processing
│   ├── search.ts             # Search functionality
│   └── seo.ts                # SEO metadata generation
└── styles/                   # CSS modules
    ├── Chat.module.css       # Chat UI styles
    ├── Header.module.css
    ├── Footer.module.css
    └── ...
```

## 📝 Content Management
```

### Adding Pages

Create markdown files in `content/pages/`. Folder structure = URL structure.

```yaml
---
title: "About Us"
description: "Learn about our team"
seo:
  keywords: ["about", "team"]
chat:
  priority: high
  summary: "Information about our company and team"
---

# Your content here
```

- `content/pages/about/index.md` → `/about`
- `content/pages/services/consulting.md` → `/services/consulting`

### Adding Blog Posts

Create files in `content/blog/` with format: `YYYY-MM-DD-slug.md`

```yaml
---
title: "Post Title"
date: "2024-12-24"
author: "Author Name"
tags: ["AI", "Tech"]
chat:
  priority: medium
  summary: "Brief description for AI"
---

# Your content
```

## 🤖 AI Chat Configuration

See [CONFIGURATION.md](./docs/CONFIGURATION.md) for complete details.

### Quick Start

1. **Choose Provider** (edit `config/site.yaml`):
```yaml
chat:
  provider: "anthropic"  # anthropic | openai | gemini | ollama
  model: "claude-3-5-sonnet-20241022"
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
    position: "bottom-center"  # or bottom-left, bottom-right
  welcomeMessage: "Hi! How can I help?"
  multilingual:
    enabled: true          # Auto-detect and respond in user's language
    fallbackLanguage: en   # Default when detection is uncertain
```

### Multilingual Support

The AI assistant automatically detects and responds in the user's language:
- **Auto-detection**: Analyzes user input to identify language
- **Browser fallback**: Uses browser language preference when needed
- **15+ Languages**: English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Turkish, Russian, Japanese, Korean, Chinese, Arabic, Hebrew, Thai, Hindi
- **No configuration needed**: Works out of the box
- **Consistent tone**: Maintains friendly, helpful personality across all languages

Example conversations:
- User: "Hello, what can you do?" → AI responds in English
- User: "Hola, ¿qué puedes hacer?" → AI responds in Spanish  
- User: "こんにちは、何ができますか？" → AI responds in Japanese
- User: "你好，你能做什么？" → AI responds in Chinese

### Supported Providers

- **Anthropic Claude** (recommended): Fast, accurate, great for Q&A
- **OpenAI GPT**: Versatile, widely supported
- **Google Gemini**: Good alternative, competitive pricing
- **Ollama**: Free, runs locally, privacy-focused

## 🎨 Customization

### Branding (No Code Required!)

Edit `config/site.yaml`:
```yaml
site:
  name: "Your Company"
  logo: "/logo.png"
  
branding:
  primaryColor: "#FF6B35"
  secondaryColor: "#004E89"
  fontFamily: "Inter, sans-serif"
```

Colors and fonts update automatically!

### SEO & Metadata

Automatic SEO optimization with per-page overrides:

```yaml
seo:
  title: "Custom SEO Title"
  description: "Under 160 characters"
  keywords: ["keyword1", "keyword2"]
```

Generates:
- Meta tags
- Open Graph tags
- Twitter Card tags
- Structured data

## 📚 Documentation

- **[TESTING.md](./docs/TESTING.md)**: Complete testing guide
- **[CONFIGURATION.md](./docs/CONFIGURATION.md)**: Complete configuration guide
- **[ICONS.md](./docs/ICONS.md)**: Icon usage reference
- **[QUICKSTART.md](./docs/QUICKSTART.md)**: 5-minute setup guide
- **[CHAT-POSITIONS.md](./docs/CHAT-POSITIONS.md)**: Chat positioning guide
- **This README**: Quick start and overview

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

Works on Netlify, Railway, Render, or any Node.js host.

**Static Export:**
```js
// next.config.js
module.exports = {
  output: 'export',  // For static hosting
}
```

## 🔧 Development

### File Organization

- **`/config`**: YAML configuration
- **`/app`**: Next.js pages and API routes
- **`/components`**: React components
- **`/lib`**: Utility functions and logic
- **`/content`**: Markdown content files
- **`/styles`**: CSS modules

### Testing

Comprehensive test suite with Jest, React Testing Library, and Playwright.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

**Coverage:**
- Unit tests for utilities and functions
- Component tests for UI elements
- API route tests
- E2E tests for critical user flows

See [TESTING.md](./docs/TESTING.md) for complete testing guide.

### Extending Functionality

**Add a new AI provider:**
1. Create class in `lib/ai-providers.ts` implementing `AIProvider`
2. Add to `getProvider()` switch statement
3. Update config schema in `lib/config.ts`

**Add custom page metadata:**
1. Add fields to frontmatter schema in `lib/markdown.ts`
2. Update parsing logic
3. Use in components

## 🌟 Use Cases

Perfect for:
- **Company Websites** with AI assistant
- **Documentation Sites** with smart search
- **Knowledge Bases** with conversational interface
- **Blogs** with AI content helper
- **Product Sites** with interactive Q&A
- **Portfolios** with intelligent navigation

## 📦 What Makes This Special

✅ **True Configuration-Driven**: Change everything via YAML  
✅ **AI-Native**: Built-in AI chat, not an afterthought  
✅ **Multi-Provider**: Never locked into one AI service  
✅ **Multi-language Ready**: 17 languages with AI translation  
✅ **User Bookmarking**: Built-in favourites system  
✅ **Content-First**: Markdown everywhere, no database needed  
✅ **Production-Ready**: SEO, dark mode, responsive, fast  
✅ **Developer-Friendly**: TypeScript, modular, well-documented  
✅ **Universal Template**: Clone once, use for any site  

## 🤝 Contributing

This is a template project. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Troubleshooting

**Chat doesn't work:**
- Check API key in `.env.local`
- Verify `chat.enabled: true` in config
- Check browser console for errors
- Ensure provider name matches exactly

**Colors not updating:**
- Restart dev server after config changes
- Check color format is valid hex
- Clear browser cache

**Build fails:**
- Run `npm install` again
- Check all required dependencies installed
- Verify Node.js version (18+)

For more help, see [CONFIGURATION.md](./docs/CONFIGURATION.md)

---

**Built with ❤️ using Next.js, TypeScript, and AI**
