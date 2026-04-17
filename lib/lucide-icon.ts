import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconRegistry = LucideIcons as unknown as Record<string, LucideIcon | undefined>;

/**
 * Safely look up a Lucide icon component by name.
 * Returns `fallback` if the name is not a valid icon — avoids silently rendering undefined.
 */
export function getLucideIcon<F extends LucideIcon | null>(
  name: string | undefined | null,
  fallback: F
): LucideIcon | F {
  if (!name) return fallback;
  const icon = iconRegistry[name];
  return typeof icon === 'function' ? icon : fallback;
}
