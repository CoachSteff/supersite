/**
 * Tests for lib/hero-registry.ts — the hero component resolver.
 */

import React from 'react';
import { resolveHero, listHeroIds, NoneHero } from '@/lib/hero-registry';
import type { FullTheme } from '@/lib/theme-system';

function makeTheme(heroes?: Record<string, React.ComponentType<any>>): FullTheme {
  return {
    meta: {} as FullTheme['meta'],
    structure: {} as FullTheme['structure'],
    blocks: { sidebar: [], sections: [], footerWidgets: [] },
    colors: { colors: { light: {} as any, dark: {} as any } } as FullTheme['colors'],
    heroes,
  };
}

describe('resolveHero', () => {
  it('returns NoneHero for id="none"', () => {
    expect(resolveHero('none', makeTheme())).toBe(NoneHero);
  });

  it('returns NoneHero when id is undefined', () => {
    expect(resolveHero(undefined, makeTheme())).toBe(NoneHero);
  });

  it('returns theme-supplied hero when registered', () => {
    const Spectrum: React.FC<any> = () => null;
    const theme = makeTheme({ spectrum: Spectrum });
    expect(resolveHero('spectrum', theme)).toBe(Spectrum);
  });

  it('falls back to NoneHero when id is unknown (with warning)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = makeTheme();
    expect(resolveHero('not-a-real-hero', theme)).toBe(NoneHero);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('listHeroIds', () => {
  it('includes the core none hero', () => {
    expect(listHeroIds(makeTheme())).toContain('none');
  });

  it('merges theme-supplied heroes with the core registry', () => {
    const theme = makeTheme({
      spectrum: () => null,
      mesh: () => null,
    });
    const ids = listHeroIds(theme);
    expect(ids).toContain('none');
    expect(ids).toContain('spectrum');
    expect(ids).toContain('mesh');
  });
});
