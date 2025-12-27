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
2. **Test your changes**:
   ```bash
   npm run test:ci        # Run unit tests
   npm run test:e2e       # Run E2E tests
   npm run build          # Ensure build succeeds
   ```
3. **Update documentation** if needed
4. **Update CHANGELOG.md** in the `[Unreleased]` section
5. **Commit your changes** with clear, descriptive messages

## Coding Standards

- **TypeScript**: Use strict type checking, avoid `any`
- **Components**: Prefer server components unless client-side features needed
- **Testing**: Write tests for new features and bug fixes
- **Documentation**: Update docs for user-facing changes
- **CHANGELOG**: Document all changes in CHANGELOG.md

## Testing Requirements

All contributions must:
- ✅ Pass all existing tests (`npm run test:ci`)
- ✅ Pass E2E tests (`npm run test:e2e`)
- ✅ Include tests for new features
- ✅ Include regression tests for bug fixes
- ✅ Build successfully (`npm run build`)

## Pull Request Process

1. **Update CHANGELOG.md** with your changes
2. **Ensure all tests pass**
3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Create a Pull Request** on GitHub
5. **Describe your changes** clearly in the PR description
6. **Wait for review** - maintainers will review your PR

## Code Review

All submissions require review. We use GitHub pull requests for this purpose. Reviewers will check:

- Code quality and standards
- Test coverage
- Documentation updates
- CHANGELOG.md updates

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and helpers
- `config/` - Configuration files (site.yaml)
- `content/` - Markdown content (pages, blog)
- `docs/` - Documentation
- `__tests__/` - Jest unit tests
- `e2e/` - Playwright E2E tests

## Running Tests Locally

```bash
# Unit tests (watch mode)
npm run test

# Unit tests (CI mode with coverage)
npm run test:ci

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Run all tests
npm run test:all
```

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Read the documentation in the `docs/` folder

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
