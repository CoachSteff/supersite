# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-02-10

### User Features
- **Favourites/Bookmarking System**: Save and manage favourite pages and blog posts
  - `/favourites` page with search and filtering
  - Filter by type (pages vs blog posts)
  - Persistent storage in localStorage
  - Star icon on all pages for quick bookmarking
- **Loading States**: Smooth loading indicators for page transitions
  - Global loading component (`app/loading.tsx`)
  - Blog-specific loading state (`app/blog/loading.tsx`)
  - Translation loading overlay in language switcher

### Internationalization
- **Multi-language Support**: 17 languages supported with automatic detection
  - Languages: English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Turkish, Russian, Japanese, Korean, Chinese, Arabic, Hebrew, Thai, Hindi
  - Script-based detection: CJK, Cyrillic, Arabic, Hebrew, Thai, Devanagari, Latin
  - Browser language preference fallback
- **AI-Powered Translation Service**:
  - On-demand content translation using AI providers
  - Translation caching system (`.cache/translations/`)
  - Preserves markdown formatting and frontmatter
  - Content hash-based cache keys for efficiency
- **Language Routing Middleware**:
  - URL-based language selection (`/nl/`, `/fr/`, etc.)
  - Header-based language passing to components
  - Edge-compatible middleware
- **Language Switcher Component**:
  - Dropdown with flag icons for all languages
  - Loading state during translation
  - Automatic URL generation for language variants
  - Click-outside detection and keyboard navigation

### Authentication Enhancements
- **Avatar System Improvements**:
  - User icon fallback for missing profile pictures
  - Light/dark mode adaptation for icons
  - Consistent avatar component usage across app
  - Profile page layout enhancements
- **User Profile Features**:
  - Auto-resize profile images
  - Dynamic social links display
  - Influencer-style profile layouts

### Architectural Changes
- **Architectural Consolidation**: Removed duplicate chat components and legacy theme system
- Renamed `ChatProviderEnhanced` → `ChatProvider` and `ChatWindowEnhanced` → `ChatWindow`
- Removed legacy single-file theme system in favor of folder-based themes
- Completed sidebar implementation with real data sources for categories, tags, and recent posts
- Version aligned to 0.2.0 (dropping alpha designation)
- `getActiveTheme()` now returns `FullTheme` directly instead of legacy `Theme` type

### Added Files
- `lib/language-detector.ts` - Language detection utilities (17 languages)
- `lib/translation-service.ts` - AI translation with caching
- `middleware.ts` - Language routing middleware
- `components/LanguageSwitcher.tsx` - Language selection UI with flags
- `components/FavouritesList.tsx` - Favourites management component
- `components/CenterChatLayout.tsx` - Centered chat layout option
- `components/ChatSidebar.tsx` - Chat sidebar component
- `app/favourites/page.tsx` - Favourites management page
- `app/api/favorites/route.ts` - Favourites API endpoint
- `app/loading.tsx` - Global loading component
- `app/blog/loading.tsx` - Blog loading component
- `styles/Favourites.module.css` - Favourites styling
- `styles/LanguageSwitcher.module.css` - Language switcher styling
- `styles/Loading.module.css` - Loading component styling
- Helper functions in `lib/markdown.ts`: `getAllTags()`, `getAllCategories()`, `getRecentBlogPosts()`
- Social links configuration in `config/site.yaml` and schema
- Social links widget with icons (Twitter, GitHub, LinkedIn, YouTube, Instagram)
- Full data wiring for all sidebar widgets

### Fixed
- Version confusion between package.json and changelogs
- TODOs in Sidebar component now resolved with real data
- React hydration errors in AuthButton
- Avatar fallback handling for missing user images

### Removed
- `components/ChatProvider.tsx` (legacy, superseded by Enhanced version)
- `components/ChatWindow.tsx` (legacy, superseded by Enhanced version)  
- `lib/theme-loader.ts` (legacy theme system)
- `lib/theme-schema.ts` (legacy theme types)
- Single-file themes: `default.yaml`, `modern.yaml`, `minimal.yaml`, `dark.yaml`, `vibrant.yaml`
- `getActiveFullTheme()` function (merged with `getActiveTheme()`)
- Development test files and artifacts (`__tests__/`, `__mocks__/`, `e2e/`, `coverage/`)
- Development documentation and test reports

## [0.1.0-alpha.2] - 2024-12-28

### Added
- **Multi-theme system** with 5 built-in themes
  - `themes/default.yaml` - Clean, professional blue theme
  - `themes/modern.yaml` - Contemporary teal/cyan theme
  - `themes/minimal.yaml` - High-contrast black/white minimalist theme
  - `themes/dark.yaml` - Purple/pink dark-first theme
  - `themes/vibrant.yaml` - Colorful orange/green theme
- **Custom theme support**
  - `themes-custom/` directory for user themes (gitignored)
  - Full theme schema with colors, typography, spacing, layout
  - Theme schema validation with Zod (`lib/theme-schema.ts`)
- **Theme configuration** in YAML
  - `branding.theme` - Select theme by name (e.g., "modern", "custom/my-theme")
  - `branding.overrides` - Override specific theme values without creating full custom theme
  - Theme resolution: custom → template → default fallback
  - "custom/" prefix for explicit custom theme reference
- **Theme setup script**
  - `npm run setup:theme` - List available themes and show setup instructions
- **Comprehensive theme documentation**
  - `docs/THEMES.md` - Complete theme guide with examples and best practices
  - Updated `docs/CONFIGURATION.md` with theme configuration section
  - Updated `docs/QUICKSTART.md` with theme selection step
  - Updated `README.md` with theming features
- **Dual-configuration system** for conflict-free customization
  - `config/site.yaml` - Template config (git-tracked)
  - `config/site.local.yaml` - User overrides (gitignored)
  - Deep merge: user config overrides template defaults
  - Users only specify settings they want to change
- **Dual-directory content system** for conflict-free content management
  - `content/` - Template content (git-tracked)
  - `content-custom/` - User content (gitignored, default location)
  - Configurable content path via `content.customDirectory` in config
  - Priority: custom directory → content-custom → content
- **Setup scripts** for easy onboarding
  - `npm run setup` - Complete setup (config + content)
  - `npm run setup:config` - Create user config with examples
  - `npm run setup:content` - Copy template content to custom directory
- **Content directory configuration** in YAML
  - `content.customDirectory` - Path to user content
  - `content.templateDirectory` - Path to template content
- **Comprehensive documentation**
  - `docs/CONTENT-MANAGEMENT.md` - Complete content management guide
  - Updated `docs/QUICKSTART.md` with setup workflow
  - Updated `docs/CONFIGURATION.md` with dual-config system
  - Updated `README.md` with new quick start

### Changed
- **ESLint configuration** added with strict Next.js rules
  - Enforces accessibility best practices via `next/core-web-vitals`
  - Prevents `any` type usage for better type safety
  - Enforces proper React keys in list operations
  - Allows only `console.warn` and `console.error` in production code
- **Code quality improvements**
  - Fixed array index keys in `components/Search.tsx` and `components/ChatWindow.tsx` to use unique identifiers
  - Replaced `any` types with proper TypeScript types in `lib/config.ts`, `lib/seo.ts`, and `lib/markdown.ts`
  - Improved type safety in utility functions (`deepMerge`, `isObject`)
  - Added `.eslintignore` to exclude setup scripts from linting
- **ThemeLoader component** completely rewritten (`components/ThemeLoader.tsx`)
  - Now loads full theme objects instead of just branding colors
  - Dynamically injects all CSS custom properties (colors, typography, spacing, layout)
  - Supports automatic dark mode color injection via dynamic `<style>` element
  - Converts camelCase theme properties to kebab-case CSS variables
- **Configuration schema** updated (`lib/config.ts`)
  - `branding` section now includes `theme` and `overrides` fields
  - Added `ThemeOverridesSchema` for partial theme customization
  - Legacy `primaryColor`, `secondaryColor`, `fontFamily` still supported but deprecated
  - New `getActiveTheme()` function to load and merge themes
  - Improved type safety in `deepMerge` and `isObject` functions
- **Client configuration API** updated (`lib/config.ts`)
  - `getClientSafeConfig()` now exposes full theme colors for client use
  - Theme data available to client components for dynamic styling
- **Configuration loading** (`lib/config.ts`)
  - Added `ContentConfigSchema` for content path configuration
  - Implemented deep merge for config files
  - Support for optional `site.local.yaml`
- **Content resolution** (`lib/markdown.ts`)
  - Dynamic content directory resolution based on config
  - Fallback chain: custom → content-custom → content
  - Warning when configured path doesn't exist
  - Improved type safety in `parseMarkdown` function
- **SEO metadata generation** (`lib/seo.ts`)
  - Proper TypeScript Metadata type instead of `any`
  - Type-safe metadata object construction
- Updated `.gitignore` to exclude:
  - `themes-custom/` (user custom themes)
  - `config/site.local.yaml` (user config)
  - `content-custom/` (user content)
- Updated `.cursorrules` with theme system patterns and ESLint standards

### Deprecated
- **Direct branding colors in config** (still functional but deprecated)
  - `branding.primaryColor`, `branding.secondaryColor`, `branding.fontFamily`
  - Users should migrate to `branding.theme` and `branding.overrides`
  - Legacy config still works with console warning in `getActiveTheme()`

### Fixed
- Git conflicts when users customize configuration
- Git conflicts when users customize content
- Template updates overwriting user customizations

### Security
- User config, content, and themes are gitignored and safe from accidental commits
- Template updates never touch user files

## [0.1.0-alpha.1] - 2024-12-27

### Added
- First public alpha release on GitHub
- Ready for community testing and feedback

### Fixed
- Updated documentation links in content files to point to GitHub repository instead of local file paths

## [0.1.0] - 2024-12-25

### Added
- Initial alpha release
- AI chat integration with multi-provider support (Anthropic, OpenAI, Gemini, Ollama)
- YAML-based configuration system (`config/site.yaml`)
- Markdown-based content management system
- Auto-generated navigation from folder structure
- Full-text search functionality across all content
- Blog system with date-based posts and tags
- Contact form with validation
- Dark/light mode support with system preference detection
- Responsive design with mobile-first approach
- Comprehensive test suite (Jest + Playwright)
  - 51/51 unit tests passing (100%)
  - Full E2E test coverage
- Complete documentation in `docs/` directory
  - Configuration guide
  - Testing guide
  - Quick start guide
  - Chat positions reference
  - Icon library reference
- GitHub templates for issues and pull requests
- Security policy (SECURITY.md)
- Contributing guidelines (CONTRIBUTING.md)
- MIT License
- Environment variable template (env.template)

### Changed
- Replaced example content with generic "SuperSite" branding
- Reorganized documentation into `docs/` and `docs/dev/` directories
- Updated test suite to 100% pass rate
- Updated `.gitignore` to exclude sensitive files (.cursorrules, .env)
- Set version to 0.1.0 for alpha release
- Updated package.json with repository information and keywords

### Security
- All API keys secured via `.env.local` (gitignored)
- Client-safe configuration API endpoint
- Server-side only AI provider access
- Input validation on all forms and API routes
- CSRF protection enabled
- Markdown rendering safe from XSS attacks

---

**Note**: This is an alpha release. APIs and configuration may change in future versions.
