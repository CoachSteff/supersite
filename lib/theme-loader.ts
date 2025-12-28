import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ThemeSchema, type Theme } from './theme-schema';

export function loadTheme(themeName: string): Theme {
  const cwd = process.cwd();
  
  // Handle "custom/theme-name" format
  let themeFile = themeName;
  let searchDirs = ['themes-custom', 'themes'];
  
  if (themeName.startsWith('custom/')) {
    themeFile = themeName.replace('custom/', '');
    searchDirs = ['themes-custom']; // Only search custom directory
  }
  
  // Try each directory in priority order
  for (const dir of searchDirs) {
    const themePath = path.join(cwd, dir, `${themeFile}.yaml`);
    if (fs.existsSync(themePath)) {
      try {
        const themeContent = fs.readFileSync(themePath, 'utf8');
        const rawTheme = yaml.load(themeContent);
        return ThemeSchema.parse(rawTheme);
      } catch (error) {
        console.error(`Error loading theme from ${themePath}:`, error);
        throw error;
      }
    }
  }
  
  // Fallback to default theme
  const defaultPath = path.join(cwd, 'themes', 'default.yaml');
  if (fs.existsSync(defaultPath)) {
    if (themeName !== 'default') {
      console.warn(`Theme "${themeName}" not found, falling back to default`);
    }
    const themeContent = fs.readFileSync(defaultPath, 'utf8');
    const rawTheme = yaml.load(themeContent);
    return ThemeSchema.parse(rawTheme);
  }
  
  throw new Error('No themes found. Default theme missing.');
}

// Deep merge theme overrides
export function applyThemeOverrides(
  theme: Theme,
  overrides?: Partial<Theme>
): Theme {
  if (!overrides) {
    return theme;
  }

  return {
    name: overrides.name || theme.name,
    description: overrides.description || theme.description,
    colors: {
      light: { ...theme.colors.light, ...overrides.colors?.light },
      dark: { ...theme.colors.dark, ...overrides.colors?.dark },
    },
    typography: { ...theme.typography, ...overrides.typography },
    spacing: { ...theme.spacing, ...overrides.spacing },
    layout: { ...theme.layout, ...overrides.layout },
  };
}

// List available themes
export function listAvailableThemes(): string[] {
  const cwd = process.cwd();
  const themes: string[] = [];
  
  // List template themes
  const themesDir = path.join(cwd, 'themes');
  if (fs.existsSync(themesDir)) {
    const files = fs.readdirSync(themesDir);
    files
      .filter(f => f.endsWith('.yaml'))
      .forEach(f => themes.push(f.replace('.yaml', '')));
  }
  
  // List custom themes
  const customDir = path.join(cwd, 'themes-custom');
  if (fs.existsSync(customDir)) {
    const files = fs.readdirSync(customDir);
    files
      .filter(f => f.endsWith('.yaml'))
      .forEach(f => themes.push(`custom/${f.replace('.yaml', '')}`));
  }
  
  return themes;
}
