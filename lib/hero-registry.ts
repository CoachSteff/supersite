import React from 'react';
import type { FullTheme } from './theme-system';

/**
 * A hero component renders the top-of-page hero section for a given page.
 *
 * Heroes are theme-owned: the SuperSite framework ships only the `none` hero,
 * which renders nothing. Themes register concrete patterns (e.g. `spectrum`,
 * `mesh`, `split-frame`) by populating `theme.heroes` with their components.
 *
 * Page-type config decides which hero a page uses; the resolver looks up the
 * id in the merged registry, falling back to `none` when the id is unknown.
 */

export interface HeroProps {
  page: HeroPage;
  theme: FullTheme;
}

export interface HeroPage {
  title: string;
  description?: string;
  /** Frontmatter passthrough — heroes can read site-defined extras from here. */
  custom?: Record<string, unknown>;
}

export type HeroComponent = React.ComponentType<HeroProps>;

/** Core `none` hero — renders nothing. */
export const NoneHero: HeroComponent = () => null;

/**
 * Core hero registry — only `none` is shipped by the framework.
 * Themes augment this via their `heroes` field on the FullTheme.
 */
const CORE_HEROES: Record<string, HeroComponent> = {
  none: NoneHero,
};

/**
 * Resolve a hero component by id. Theme-supplied heroes win over the core
 * registry; unknown ids resolve to the `none` hero with a console.warn.
 */
export function resolveHero(
  id: string | undefined,
  theme: FullTheme
): HeroComponent {
  if (!id || id === 'none') return NoneHero;

  const themeHero = theme.heroes?.[id];
  if (themeHero) return themeHero;

  const coreHero = CORE_HEROES[id];
  if (coreHero) return coreHero;

  if (typeof console !== 'undefined') {
    console.warn(
      `[supersite] No hero registered for id "${id}". Falling back to 'none'. ` +
      `Register heroes on the theme's "heroes" field or use a known id.`
    );
  }
  return NoneHero;
}

/** List all hero ids known to the merged registry — useful for tooling. */
export function listHeroIds(theme: FullTheme): string[] {
  const ids = new Set<string>(Object.keys(CORE_HEROES));
  if (theme.heroes) {
    for (const id of Object.keys(theme.heroes)) ids.add(id);
  }
  return Array.from(ids).sort();
}
