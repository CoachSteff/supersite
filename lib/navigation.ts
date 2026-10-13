import { getFolderStructure, type NavItem } from './markdown';
import { getSiteConfig } from './config';

/**
 * Resolve the site navigation items by merging auto-generated folder structure
 * (when `navigation.autoGenerate` is true) with the explicit `customLinks`
 * from the site config, deduped by path.
 *
 * This is the canonical server-side source of nav items, used by both the
 * `/api/navigation` route (for client `Navigation`) and theme hero components
 * that render their own nav.
 */
export function getNavigationItems(): NavItem[] {
  const config = getSiteConfig();
  let items: NavItem[] = [];

  if (config.navigation?.autoGenerate) {
    items = getFolderStructure();
  }

  if (config.navigation?.customLinks) {
    const existingPaths = new Set(items.map((item) => item.path));
    const newLinks = config.navigation.customLinks.filter(
      (link) => !existingPaths.has(link.path)
    );
    items = [...items, ...newLinks];
  }

  return items;
}
