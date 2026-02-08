'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { FullTheme } from '@/lib/theme-system';

interface ThemeContextValue {
  theme: FullTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useFullTheme(): FullTheme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useFullTheme must be used within ThemeContextProvider');
  }
  return context.theme;
}

export function useThemeFeatures() {
  const theme = useFullTheme();
  return theme.meta.features;
}

export function useThemeStructure() {
  const theme = useFullTheme();
  return theme.structure;
}

export function useThemeBlocks() {
  const theme = useFullTheme();
  return theme.blocks;
}

interface ThemeContextProviderProps {
  theme: FullTheme;
  children: ReactNode;
}

export function ThemeContextProvider({ theme, children }: ThemeContextProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
