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

function applyTheme(theme: FullTheme, mode: 'light' | 'dark') {
  const root = document.documentElement;
  const themeData = theme as any;
  const colors = mode === 'dark' ? themeData.colors?.colors?.dark : themeData.colors?.colors?.light;

  console.log('[ThemeLoader] Applying theme:', { mode, hasColors: !!colors });

  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', mode);

  // Map theme keys to CSS variable names (matching globals.css expectations)
  const colorMapping: Record<string, string> = {
    primary: '--primary-color',
    secondary: '--secondary-color',
    text: '--text-color',
    textLight: '--text-light',
    background: '--background',
    backgroundSecondary: '--background-secondary',
    border: '--border-color',
    success: '--success-color',
    error: '--error-color',
  };

  // Apply colors if available
  if (colors && typeof colors === 'object') {
    try {
      Object.entries(colors).forEach(([key, value]) => {
        const cssVar = colorMapping[key] || `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, String(value));
      });
    } catch (error) {
      console.error('[ThemeLoader] Error applying theme colors:', error);
    }
  } else {
    console.warn('[ThemeLoader] No valid color palette found for mode:', mode);
  }

  // Apply typography if available (from colors.yaml)
  const typographyMapping: Record<string, string> = {
    fontFamily: '--font-family',
    fontFamilyMono: '--font-family-mono',
    baseFontSize: '--font-size-base',
  };
  
  if (themeData.typography) {
    Object.entries(themeData.typography).forEach(([key, value]) => {
      const cssVar = typographyMapping[key] || `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, String(value));
    });
  }

  // Apply spacing if available
  if (themeData.spacing) {
    Object.entries(themeData.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, String(value));
    });
  }

  // Apply layout if available
  if (themeData.borderRadius) {
    root.style.setProperty('--border-radius', String(themeData.borderRadius));
  }
}

// Export provider wrapper for layout
export function ThemeProvider({ 
  theme, 
  children 
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
    console.log('[ThemeLoader] Setting mode:', newMode);
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
