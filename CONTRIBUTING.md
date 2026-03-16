# Contributing to Supersite

Thank you for your interest in contributing to Supersite! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/supersite.git
   cd supersite
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Make your changes** following our coding standards
2. **Verify your changes**:
   ```bash
   npm run build          # Ensure build succeeds
   npm run lint           # Check for lint errors
   ```
3. **Update documentation** if needed
4. **Update CHANGELOG.md** in the `[Unreleased]` section
5. **Commit your changes** with clear, descriptive messages

## Coding Standards

- **TypeScript**: Use strict type checking, avoid `any`
- **Components**: Prefer server components unless client-side features needed
- **Documentation**: Update docs for user-facing changes
- **CHANGELOG**: Document all changes in CHANGELOG.md

## Framework vs. Site-Specific Boundary

SuperSite separates framework code (git-tracked) from site-specific content (git-ignored). When contributing, only modify framework code:

**Framework (tracked, contributions welcome):**
- `app/`, `components/`, `lib/`, `styles/` — Application code
- `themes/` — Built-in theme templates
- `content/` — Template/demo content
- `config/site.yaml` — Template configuration
- `docs/` — Documentation

**Site-specific (git-ignored, never committed):**
- `themes-custom/` — User custom themes
- `content-custom/` — User content
- `config/site.local.yaml` — User configuration overrides
- `.env.local` — API keys and secrets

## Pull Request Process

1. **Update CHANGELOG.md** with your changes
2. **Ensure the build passes**: `npm run build`
3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Create a Pull Request** on GitHub
5. **Describe your changes** clearly in the PR description
6. **Wait for review** — maintainers will review your PR

## Code Review

All submissions require review. We use GitHub pull requests for this purpose. Reviewers will check:

- Code quality and standards
- Build success
- Documentation updates
- CHANGELOG.md updates

## Project Structure

- `app/` — Next.js App Router pages and API routes
- `components/` — React components
- `components/directives/` — Markdown directive components (23 directives)
- `lib/` — Utility functions, config, markdown processing
- `lib/theme-system/` — Folder-based theme loader and Zod schemas
- `config/` — YAML configuration files
- `content/` — Template markdown content (pages, blog)
- `themes/` — Built-in theme templates (6 themes)
- `themes-custom/` — User custom themes (git-ignored)
- `content-custom/` — User content (git-ignored)
- `styles/` — CSS modules
- `docs/` — Documentation

## Adding a New Directive

1. Create the component in `components/directives/YourDirective.tsx`
2. Export it from `components/directives/index.ts`
3. Add the AST transformation case in `lib/remarkDirectives.ts`
4. Add the render case in `components/MarkdownContent.tsx`
5. Add styles in `styles/Directives.module.css`
6. Document the directive in `docs/CONTENT-MANAGEMENT.md`
7. Add an example to the test-directives page

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Read the documentation in the `docs/` folder

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
