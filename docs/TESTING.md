# Testing Guide

Comprehensive testing suite for Supersite using Jest, React Testing Library, and Playwright.

## Overview

The test suite follows a three-tier testing strategy:

1. **Unit Tests (70%)** - Jest + React Testing Library
2. **Integration Tests (20%)** - Jest with mocked dependencies
3. **E2E Tests (10%)** - Playwright

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:ci          # Unit/Integration tests with coverage
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
npm run test:e2e:ui      # E2E with UI mode
npm run test:all         # All tests (CI mode)
```

## Test Structure

```
supersite/
├── __tests__/           # Unit & Integration tests
│   ├── lib/            # Utility function tests
│   ├── components/     # Component tests
│   └── api/            # API route tests
├── e2e/                # E2E tests
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   ├── chat.spec.ts
│   └── features.spec.ts
├── jest.config.ts      # Jest configuration
├── jest.setup.ts       # Test setup
└── playwright.config.ts # Playwright configuration
```

## Unit Tests

### Running Unit Tests

```bash
# Watch mode (development)
npm test

# CI mode with coverage
npm run test:ci

# Coverage report
npm run test:coverage
```

### Test Files

**Utility Tests (`__tests__/lib/`)**
- `favorites.test.ts` - localStorage favorites management
- `config.test.ts` - YAML configuration loading
- `context-builder.test.ts` - AI context building utilities

**Component Tests (`__tests__/components/`)**
- `PageActions.test.tsx` - Page action buttons
- `SharePopup.test.tsx` - Share modal
- `MarkdownContent.test.tsx` - Content rendering

**API Tests (`__tests__/api/`)**
- `config.test.ts` - Configuration API
- `navigation.test.ts` - Navigation API

### Writing Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });
});
```

### Coverage Thresholds

Current thresholds (configured in `jest.config.ts`):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## E2E Tests

### Running E2E Tests

```bash
# Headless mode
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed
```

### Test Files

- **`homepage.spec.ts`** - Homepage functionality and page actions
- **`navigation.spec.ts`** - Navigation and routing
- **`chat.spec.ts`** - AI chat functionality
- **`features.spec.ts`** - Search and contact form

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    const button = page.getByRole('button', { name: /click me/i });
    await button.click();
    
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

## Mocking

### Mocking Modules

```typescript
jest.mock('@/lib/config', () => ({
  getSiteConfig: jest.fn(() => ({
    site: { name: 'Test Site' },
  })),
}));
```

### Mocking API Calls

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' }),
  })
) as jest.Mock;
```

### Mocking Browser APIs

```typescript
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
expect(component.state.count).toBe(1);
```

✅ **Good:**
```typescript
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Use Accessible Queries

Priority order:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByText` - For content
4. `getByTestId` - Last resort

### 3. Clean Up After Tests

```typescript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

### 4. Test Edge Cases

```typescript
describe('Input validation', () => {
  it('should handle empty input', () => { ... });
  it('should handle invalid format', () => { ... });
  it('should handle maximum length', () => { ... });
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

**Steps:**
1. Install dependencies
2. Run linter
3. Run unit tests with coverage
4. Install Playwright browsers
5. Run E2E tests
6. Upload coverage reports
7. Build project

### Environment Variables

Required for CI:
```bash
ANTHROPIC_API_KEY=your-key     # For AI chat tests
OPENAI_API_KEY=your-key        # Optional
GEMINI_API_KEY=your-key        # Optional
```

Add these as GitHub Secrets in repository settings.

## Debugging Tests

### Debug Unit Tests

```bash
# Run specific test file
npm test -- favorites.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should toggle favorite"

# Debug in VS Code
# Add breakpoint and press F5
```

### Debug E2E Tests

```bash
# UI mode (best for debugging)
npm run test:e2e:ui

# Headed mode
npm run test:e2e:headed

# Debug specific test
npx playwright test homepage.spec.ts --debug
```

### View Test Reports

```bash
# Playwright HTML report
npx playwright show-report

# Jest coverage report
open coverage/lcov-report/index.html
```

## Common Issues

### Issue: Tests timeout

**Solution:**
```typescript
// Increase timeout for slow tests
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Issue: "Cannot find module"

**Solution:**
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Playwright browser not found

**Solution:**
```bash
npx playwright install --with-deps
```

## Test Coverage

View detailed coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

Current coverage:
- **Utilities:** ~90%
- **Components:** ~75%
- **API Routes:** ~80%
- **Overall:** ~70%+

## Performance

### Test Speed

- **Unit tests:** ~10-20 seconds
- **E2E tests:** ~30-60 seconds
- **Total:** ~1-2 minutes

### Optimization Tips

1. **Run tests in parallel:**
   ```bash
   npm test -- --maxWorkers=4
   ```

2. **Run only changed tests:**
   ```bash
   npm test -- --onlyChanged
   ```

3. **Use `.only` for focused testing:**
   ```typescript
   test.only('this test only', () => { ... });
   ```

## Continuous Improvement

### Adding New Tests

1. Create test file next to source file or in `__tests__/`
2. Follow naming convention: `*.test.ts` or `*.spec.ts`
3. Ensure coverage thresholds are met
4. Update this documentation if needed

### Updating Test Suite

When adding new features:
1. Write tests first (TDD) or alongside implementation
2. Add unit tests for utilities/functions
3. Add component tests for UI components
4. Add E2E tests for critical user flows
5. Update coverage thresholds if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Questions or issues?** Check the main [README.md](./README.md) or open an issue.
