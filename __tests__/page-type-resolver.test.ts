/**
 * Tests for lib/page-type-resolver.ts
 *
 * Validates that page frontmatter → page-types.yaml registry resolution behaves
 * as documented: frontmatter inline overrides win, then registry entry, then
 * theme default, then hard fallback.
 */

import { resolvePageLayout } from '@/lib/page-type-resolver';
import type { FullTheme, PageTypesFile } from '@/lib/theme-system';

function makeTheme(pageTypes?: PageTypesFile): FullTheme {
  return {
    meta: { name: 'test', version: '1.0.0', defaultColors: 'colors.yaml', features: { search: true, chat: true, darkMode: true, auth: false, newsletter: false, comments: false, socialShare: true } } as FullTheme['meta'],
    structure: {} as FullTheme['structure'],
    blocks: { sidebar: [], sections: [], footerWidgets: [] },
    colors: { colors: { light: {} as any, dark: {} as any } } as FullTheme['colors'],
    pageTypes,
  };
}

describe('resolvePageLayout', () => {
  it('falls back to hero=none when theme has no pageTypes registry', () => {
    const theme = makeTheme();
    const result = resolvePageLayout({}, theme);
    expect(result.pageType).toBe('default');
    expect(result.hero).toBe('none');
  });

  it('uses the registry entry matching the frontmatter pageType', () => {
    const theme = makeTheme({
      default: 'default',
      types: {
        default: { hero: 'none' },
        home: { hero: 'spectrum' },
      },
    });
    const result = resolvePageLayout({ pageType: 'home' }, theme);
    expect(result.pageType).toBe('home');
    expect(result.hero).toBe('spectrum');
  });

  it('falls back to default entry when pageType is unknown', () => {
    const theme = makeTheme({
      default: 'default',
      types: {
        default: { hero: 'mesh' },
      },
    });
    const result = resolvePageLayout({ pageType: 'does-not-exist' }, theme);
    expect(result.pageType).toBe('does-not-exist');
    expect(result.hero).toBe('mesh');
  });

  it('honours a custom default id', () => {
    const theme = makeTheme({
      default: 'app',
      types: {
        app: { hero: 'split-frame' },
      },
    });
    const result = resolvePageLayout({}, theme);
    expect(result.pageType).toBe('app');
    expect(result.hero).toBe('split-frame');
  });

  it('allows inline frontmatter overrides to win over the registry', () => {
    const theme = makeTheme({
      default: 'default',
      types: {
        default: { hero: 'none', body: 'standard' },
        home: { hero: 'spectrum', body: 'wide' },
      },
    });
    const result = resolvePageLayout(
      { pageType: 'home', hero: 'mesh', body: 'narrow' },
      theme
    );
    expect(result.hero).toBe('mesh');
    expect(result.body).toBe('narrow');
  });

  it('passes through header and footer overrides', () => {
    const theme = makeTheme({
      default: 'default',
      types: {
        default: { hero: 'none', header: 'full', footer: 'minimal' },
      },
    });
    const result = resolvePageLayout({}, theme);
    expect(result.header).toBe('full');
    expect(result.footer).toBe('minimal');
  });
});
