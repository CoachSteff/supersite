import type { FullTheme, PageTypeEntry } from './theme-system';

/**
 * Resolve a page's effective layout config from its frontmatter `pageType`
 * (or a falls-back default) against the theme's `page-types.yaml` registry.
 *
 * Resolution order:
 *   1. The page's own frontmatter `pageType` value.
 *   2. The theme's `pageTypes.default` value (typically "default").
 *   3. Hard-coded fallback: { hero: 'none' }.
 *
 * Page authors can also override individual fields inline via the frontmatter
 * `hero`, `header`, `body`, `footer` keys — these take precedence over the
 * registry entry.
 */

export interface PageLayoutFrontmatter {
  pageType?: string;
  hero?: string;
  header?: string;
  body?: string;
  footer?: string;
}

export interface ResolvedPageLayout {
  pageType: string;
  hero: string;
  header?: string;
  body?: string;
  footer?: string;
}

const HARD_FALLBACK: PageTypeEntry = { hero: 'none' };

export function resolvePageLayout(
  frontmatter: PageLayoutFrontmatter | undefined,
  theme: FullTheme
): ResolvedPageLayout {
  const registry = theme.pageTypes?.types ?? {};
  const defaultId = theme.pageTypes?.default ?? 'default';

  const requested = frontmatter?.pageType ?? defaultId;

  const entry: PageTypeEntry =
    registry[requested] ?? registry[defaultId] ?? HARD_FALLBACK;

  return {
    pageType: requested,
    hero: frontmatter?.hero ?? entry.hero ?? 'none',
    header: frontmatter?.header ?? entry.header,
    body: frontmatter?.body ?? entry.body,
    footer: frontmatter?.footer ?? entry.footer,
  };
}
