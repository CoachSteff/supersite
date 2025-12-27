# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Replaced example content with generic "Supersite" branding
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
