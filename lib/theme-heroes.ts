/**
 * Theme → hero-module map.
 *
 * Hero components are React components owned by themes. The framework needs
 * to import them statically so Next.js can bundle them — auto-discovery would
 * be unreliable across build modes.
 *
 * The SuperSite repo ships an empty registry. Site-specific themes register
 * their heroes by creating a gitignored sibling `lib/theme-heroes.local.ts`
 * that exports:
 *
 * ```ts
 * import { heroes as myThemeHeroes } from '../themes-custom/my-theme/heroes';
 * import type { HeroRegistry } from './theme-system';
 * export const themeHeroes: Record<string, HeroRegistry> = {
 *   'my-theme': myThemeHeroes,
 * };
 * ```
 *
 * The `.local.ts` file is gitignored so brand-specific theme code never
 * lands in the framework repo. If the file is absent the registry stays
 * empty and `resolveHero()` falls back to the built-in `NoneHero`.
 */

import type { HeroRegistry } from './theme-system';

const THEME_HEROES: Record<string, HeroRegistry> = {};

// Allow a gitignored local file to register additional theme heroes.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const local = require('./theme-heroes.local');
  if (local?.themeHeroes && typeof local.themeHeroes === 'object') {
    Object.assign(THEME_HEROES, local.themeHeroes);
  }
} catch {
  // No local overrides — that's the normal framework default.
}

export function getThemeHeroes(themeName: string): HeroRegistry | undefined {
  return THEME_HEROES[themeName];
}
