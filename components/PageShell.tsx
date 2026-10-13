import type { ReactNode } from 'react';
import type { FullTheme } from '@/lib/theme-system';
import { resolvePageLayout, type PageLayoutFrontmatter } from '@/lib/page-type-resolver';
import { resolveHero, type HeroPage } from '@/lib/hero-registry';

/**
 * PageShell — resolves a page's `pageType` against the theme registry and
 * renders the chosen hero (if any) above the page content.
 *
 * Heroes are theme-owned and must be attached to `theme.heroes` for the
 * resolver to find them. Unknown ids fall back to the `none` hero.
 *
 * Renders as a server component to avoid passing the full theme through a
 * client boundary.
 */
interface PageShellProps {
  theme: FullTheme;
  page: PageLayoutFrontmatter & HeroPage;
  children: ReactNode;
}

export default function PageShell({ theme, page, children }: PageShellProps) {
  const layout = resolvePageLayout(page, theme);
  const HeroComponent = resolveHero(layout.hero, theme);

  return (
    <>
      <HeroComponent page={page} theme={theme} />
      {children}
    </>
  );
}
