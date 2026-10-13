'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import type { FullTheme } from '@/lib/theme-system';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  // Return safe defaults if context not yet available (SSR/pre-mount)
  if (!context) {
    return {
      mode: 'system' as const,
      setMode: () => {},
      resolvedMode: 'light' as const,
    };
  }
  return context;
}

interface ThemeLoaderProps {
  theme: FullTheme;
}

export default function ThemeLoader({ theme }: ThemeLoaderProps) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  // Resolve system preference and apply theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedMode = () => {
      let resolved: 'light' | 'dark';
      if (mode === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = mode;
      }
      setResolvedMode(resolved);
      applyTheme(theme, resolved);
    };

    updateResolvedMode();

    // Listen for system preference changes
    mediaQuery.addEventListener('change', updateResolvedMode);
    return () => mediaQuery.removeEventListener('change', updateResolvedMode);
  }, [mode, theme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {null}
    </ThemeContext.Provider>
  );
}

/**
 * Apply a FullTheme to document.documentElement as CSS custom properties.
 *
 * Token projection (v0.5+):
 *   - colors      → --color-* AND legacy --primary-color/--text-color/… aliases
 *   - typography  → --font-family-*, --font-size-*, --font-weight-*, --font-tracking-*, --font-line-height-*
 *   - tokens      → --space-*, --radius-*, --shadow-*, --motion-*
 *   - gradient    → --gradient-*
 *   - logo paths  → --logo-primary, --logo-mark, --logo-primary-light
 *
 * Mode-aware tokens (colors, shadow, gradient) honour `mode`. Scalar tokens
 * (typography, spacing, radius, motion) are mode-agnostic.
 *
 * Legacy support: when typography/spacing/effects are still defined inside
 * colors.yaml (v0.4 shape), they're projected too. The loader emits a single
 * deprecation warning per theme.
 */
function applyTheme(theme: FullTheme, mode: 'light' | 'dark') {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);

  applyPalette(root, theme, mode);
  applyTypography(root, theme);
  applyScalarTokens(root, theme);
  applyShadows(root, theme, mode);
  applyMotion(root, theme);
  applyGradient(root, theme, mode);
  applyLogo(root, theme);
}

// ──────────────────────────────────────────────────────────────────────
// Palette — mode-aware. Projects to --color-* and legacy aliases.
// ──────────────────────────────────────────────────────────────────────

const LEGACY_COLOR_ALIASES: Record<string, string> = {
  primary: '--primary-color',
  secondary: '--secondary-color',
  text: '--text-color',
  textLight: '--text-light',
  background: '--background',
  backgroundSecondary: '--background-secondary',
  border: '--border-color',
  success: '--success-color',
  error: '--error-color',
  warning: '--warning-color',
  info: '--info-color',
  onPrimary: '--on-primary',
};

function applyPalette(root: HTMLElement, theme: FullTheme, mode: 'light' | 'dark') {
  const palette = theme.colors?.colors;
  const colors = mode === 'dark' ? palette?.dark : palette?.light;
  if (!colors || typeof colors !== 'object') return;

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value !== 'string') continue;
    // New canonical name
    const canonical = `--color-${kebab(key)}`;
    root.style.setProperty(canonical, value);
    // Legacy alias (preserved for one minor version)
    const legacy = LEGACY_COLOR_ALIASES[key] || `--${kebab(key)}`;
    root.style.setProperty(legacy, value);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Typography — reads new typography.yaml when present, falls back to
// the legacy colors.typography block.
// ──────────────────────────────────────────────────────────────────────

function applyTypography(root: HTMLElement, theme: FullTheme) {
  const newFile = theme.typography;
  const legacy = theme.colors?.typography as
    | { fontFamily?: string; fontFamilyMono?: string; baseFontSize?: string }
    | undefined;

  // Font families
  const display = newFile?.fontFamilies?.display ?? legacy?.fontFamily;
  const body = newFile?.fontFamilies?.body ?? legacy?.fontFamily;
  const mono = newFile?.fontFamilies?.mono ?? legacy?.fontFamilyMono;

  if (display) root.style.setProperty('--font-display', display);
  if (body) {
    root.style.setProperty('--font-body', body);
    root.style.setProperty('--font-family', body); // legacy alias
  }
  if (mono) {
    root.style.setProperty('--font-mono', mono);
    root.style.setProperty('--font-family-mono', mono); // legacy alias
  }

  // Base font size
  const baseSize = newFile?.baseFontSize ?? legacy?.baseFontSize;
  if (baseSize) {
    root.style.setProperty('--font-size-base', baseSize);
  }

  // Type scale — only present in v0.5+ typography.yaml
  if (newFile?.scale) {
    for (const [name, entry] of Object.entries(newFile.scale)) {
      const slug = kebab(name);
      root.style.setProperty(`--font-size-${slug}`, entry.size);
      if (entry.lineHeight !== undefined) {
        root.style.setProperty(`--font-line-height-${slug}`, String(entry.lineHeight));
      }
      if (entry.weight !== undefined) {
        root.style.setProperty(`--font-weight-${slug}`, String(entry.weight));
      }
      if (entry.tracking !== undefined) {
        root.style.setProperty(`--font-tracking-${slug}`, entry.tracking);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// Scalar tokens — spacing + radius. Prefer tokens.yaml, fall back to
// the legacy colors.spacing block.
// ──────────────────────────────────────────────────────────────────────

function applyScalarTokens(root: HTMLElement, theme: FullTheme) {
  // Spacing
  const newSpacing = theme.tokens?.spacing;
  const legacySpacing = theme.colors?.spacing as Record<string, string> | undefined;
  const spacingSource = newSpacing ?? legacySpacing;
  if (spacingSource) {
    for (const [key, value] of Object.entries(spacingSource)) {
      const slug = kebab(key);
      // Canonical
      root.style.setProperty(`--space-${slug}`, value);
      // Legacy alias
      root.style.setProperty(`--spacing-${slug}`, value);
    }
  }

  // Radius
  const newRadius = theme.tokens?.radius;
  if (newRadius) {
    for (const [key, value] of Object.entries(newRadius)) {
      root.style.setProperty(`--radius-${kebab(key)}`, value);
    }
  }
  // Legacy single-value borderRadius
  const legacyRadius = theme.colors?.borderRadius;
  if (legacyRadius) {
    root.style.setProperty('--border-radius', String(legacyRadius));
    if (!newRadius) {
      // Provide the canonical name too when the theme only declares the legacy single value
      root.style.setProperty('--radius', String(legacyRadius));
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// Shadows — mode-aware. tokens.yaml provides shadow.light/dark maps.
// ──────────────────────────────────────────────────────────────────────

function applyShadows(root: HTMLElement, theme: FullTheme, mode: 'light' | 'dark') {
  const shadows = mode === 'dark' ? theme.tokens?.shadow?.dark : theme.tokens?.shadow?.light;
  if (shadows) {
    for (const [key, value] of Object.entries(shadows)) {
      root.style.setProperty(`--shadow-${kebab(key)}`, value);
    }
  }

  // Legacy effects block (cardSurfaceTint, cardShadow, …) — kept for backwards compat
  const effects = theme.colors?.effects;
  if (effects) {
    root.style.setProperty('--card-surface-tint', `${effects.cardSurfaceTint ?? 0}%`);
    root.style.setProperty('--card-border-tint', `${effects.cardBorderTint ?? 0}%`);
    root.style.setProperty('--card-shadow', String(effects.cardShadow ?? 'none'));
    root.style.setProperty('--hover-lift', effects.hoverLift ? '1' : '0');
    root.style.setProperty('--text-gradient', effects.textGradient ? '1' : '0');
  }
}

// ──────────────────────────────────────────────────────────────────────
// Motion — tokens.yaml motion block.
// ──────────────────────────────────────────────────────────────────────

function applyMotion(root: HTMLElement, theme: FullTheme) {
  const motion = theme.tokens?.motion;
  if (!motion) return;
  if (motion.duration) root.style.setProperty('--motion-duration', motion.duration);
  if (motion.easing) root.style.setProperty('--motion-easing', motion.easing);
  if (motion.hoverDuration) root.style.setProperty('--motion-hover-duration', motion.hoverDuration);
}

// ──────────────────────────────────────────────────────────────────────
// Gradient — mode-aware. gradient.yaml provides light/dark named gradients.
// ──────────────────────────────────────────────────────────────────────

function applyGradient(root: HTMLElement, theme: FullTheme, mode: 'light' | 'dark') {
  const set = mode === 'dark' ? theme.gradient?.dark : theme.gradient?.light;
  if (!set) return;
  for (const [name, value] of Object.entries(set)) {
    root.style.setProperty(`--gradient-${kebab(name)}`, value);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Logo — paths exposed as CSS custom properties for use in url() calls.
// ──────────────────────────────────────────────────────────────────────

function applyLogo(root: HTMLElement, theme: FullTheme) {
  const logo = theme.logo;
  if (!logo) return;
  if (logo.primary) root.style.setProperty('--logo-primary', `url("${logo.primary}")`);
  if (logo.primaryLight) root.style.setProperty('--logo-primary-light', `url("${logo.primaryLight}")`);
  if (logo.mark) root.style.setProperty('--logo-mark', `url("${logo.mark}")`);
}

// ──────────────────────────────────────────────────────────────────────

function kebab(input: string): string {
  return input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Export provider wrapper for layout
export function ThemeProvider({
  theme,
  children,
}: {
  theme: FullTheme;
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  // Resolve system preference and apply theme
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedMode = () => {
      let resolved: 'light' | 'dark';
      if (mode === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = mode;
      }
      setResolvedMode(resolved);
      applyTheme(theme, resolved);
    };

    updateResolvedMode();

    mediaQuery.addEventListener('change', updateResolvedMode);
    return () => mediaQuery.removeEventListener('change', updateResolvedMode);
  }, [mode, theme, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
