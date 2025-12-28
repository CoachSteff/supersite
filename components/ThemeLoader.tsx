'use client';

import { useEffect } from 'react';
import type { Theme } from '@/lib/theme-schema';

interface ThemeLoaderProps {
  theme: Theme;
}

export default function ThemeLoader({ theme }: ThemeLoaderProps) {
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply light mode colors
    Object.entries(theme.colors.light).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    
    // Apply typography
    Object.entries(theme.typography).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    
    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply layout
    Object.entries(theme.layout).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    
    // Apply dark mode CSS
    addDarkModeStyles(theme.colors.dark);
  }, [theme]);

  return null;
}

function addDarkModeStyles(darkColors: Record<string, string>) {
  // Check if style element already exists
  let styleEl = document.getElementById('theme-dark-mode');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'theme-dark-mode';
    document.head.appendChild(styleEl);
  }
  
  // Generate dark mode CSS
  const darkVars = Object.entries(darkColors)
    .map(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      return `    ${cssVar}: ${value};`;
    })
    .join('\n');
  
  styleEl.textContent = `
@media (prefers-color-scheme: dark) {
  :root {
${darkVars}
  }
}`;
}
