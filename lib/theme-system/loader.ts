import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  ThemeMetaSchema,
  StructureSchema,
  BlocksSchema,
  ColorsSchema,
  type FullTheme,
  type ThemeMeta,
  type Structure,
  type Blocks,
  type Colors,
} from './schemas';

const THEME_FILES = {
  meta: 'theme.yaml',
  structure: 'structure.yaml',
  blocks: 'blocks.yaml',
  colors: 'colors.yaml',
};

interface ThemeLoadResult {
  theme: FullTheme;
  themePath: string;
  errors: string[];
  isLegacy: boolean;
}

/**
 * Load a theme by name from themes/ or themes-custom/ directories
 * Supports both new (folder with 4 files) and legacy (single YAML) formats
 */
export function loadTheme(themeName: string): ThemeLoadResult {
  const cwd = process.cwd();
  const errors: string[] = [];

  // Determine theme path
  let themePath: string;
  let isCustom = themeName.startsWith('custom/');
  
  if (isCustom) {
    const customName = themeName.replace('custom/', '');
    themePath = path.join(cwd, 'themes-custom', customName);
  } else {
    // Check for new format (folder) first
    const folderPath = path.join(cwd, 'themes', themeName);
    const legacyPath = path.join(cwd, 'themes', `${themeName}.yaml`);
    const customFolderPath = path.join(cwd, 'themes-custom', themeName);
    
    if (fs.existsSync(customFolderPath) && fs.statSync(customFolderPath).isDirectory()) {
      themePath = customFolderPath;
    } else if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
      themePath = folderPath;
    } else if (fs.existsSync(legacyPath)) {
      // Legacy single-file theme
      return loadLegacyTheme(themeName, legacyPath);
    } else {
      // Fall back to base theme
      themePath = path.join(cwd, 'themes', 'base');
      if (!fs.existsSync(themePath)) {
        // Ultimate fallback
        return {
          theme: getDefaultTheme(),
          themePath: '',
          errors: [`Theme "${themeName}" not found, using defaults`],
          isLegacy: false,
        };
      }
      errors.push(`Theme "${themeName}" not found, falling back to base`);
    }
  }

  // Load each config file
  const meta = loadThemeFile<ThemeMeta>(themePath, THEME_FILES.meta, ThemeMetaSchema, errors);
  const structure = loadThemeFile<Structure>(themePath, THEME_FILES.structure, StructureSchema, errors);
  const blocks = loadThemeFile<Blocks>(themePath, THEME_FILES.blocks, BlocksSchema, errors);
  
  // Colors can be specified in meta.defaultColors
  const colorsFile = meta?.defaultColors || THEME_FILES.colors;
  const colors = loadThemeFile<Colors>(themePath, colorsFile, ColorsSchema, errors);

  const theme: FullTheme = {
    meta: meta || ThemeMetaSchema.parse({ name: themeName }),
    structure: structure || StructureSchema.parse({}),
    blocks: blocks || BlocksSchema.parse({}),
    colors: colors || getDefaultColors(),
  };

  return { theme, themePath, errors, isLegacy: false };
}

/**
 * Load legacy single-file theme (backward compatibility)
 */
function loadLegacyTheme(themeName: string, themePath: string): ThemeLoadResult {
  const errors: string[] = [];
  
  try {
    const content = fs.readFileSync(themePath, 'utf8');
    const raw = yaml.load(content) as Record<string, unknown>;
    
    // Convert legacy format to new format
    const layoutObj = raw.layout as Record<string, unknown> | undefined;
    const colors = ColorsSchema.parse({
      name: raw.name || themeName,
      colors: raw.colors || {},
      typography: raw.typography || {},
      spacing: raw.spacing || {},
      borderRadius: layoutObj?.borderRadius || '4px',
    });

    const theme: FullTheme = {
      meta: ThemeMetaSchema.parse({ 
        name: (raw.name as string) || themeName,
        description: raw.description as string,
      }),
      structure: StructureSchema.parse({}),
      blocks: BlocksSchema.parse({}),
      colors,
    };

    return { theme, themePath, errors, isLegacy: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Error loading legacy theme: ${message}`);
    
    return {
      theme: getDefaultTheme(),
      themePath,
      errors,
      isLegacy: true,
    };
  }
}

/**
 * Load and validate a single theme YAML file
 */
function loadThemeFile<T>(
  themePath: string,
  filename: string,
  schema: { parse: (data: unknown) => T },
  errors: string[]
): T | null {
  const filePath = path.join(themePath, filename);

  if (!fs.existsSync(filePath)) {
    // Not an error - files are optional, defaults will be used
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const raw = yaml.load(content);
    return schema.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Error loading ${filename}: ${message}`);
    return null;
  }
}

/**
 * Get default theme when nothing loads
 */
function getDefaultTheme(): FullTheme {
  return {
    meta: ThemeMetaSchema.parse({ name: 'Default' }),
    structure: StructureSchema.parse({}),
    blocks: BlocksSchema.parse({}),
    colors: getDefaultColors(),
  };
}

/**
 * Get default colors when no colors.yaml exists
 */
function getDefaultColors(): Colors {
  return ColorsSchema.parse({
    name: 'Default',
    colors: {
      light: {
        primary: '#2563eb',
        secondary: '#1e40af',
        text: '#1f2937',
        textLight: '#6b7280',
        background: '#ffffff',
        backgroundSecondary: '#f9fafb',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#93c5fd',
        text: '#f9fafb',
        textLight: '#d1d5db',
        background: '#111827',
        backgroundSecondary: '#1f2937',
        border: '#374151',
        success: '#34d399',
        error: '#f87171',
      },
    },
  });
}

/**
 * List all available themes
 */
export function listThemes(): { name: string; path: string; isCustom: boolean; isLegacy: boolean }[] {
  const cwd = process.cwd();
  const themes: { name: string; path: string; isCustom: boolean; isLegacy: boolean }[] = [];

  // Standard themes (folders)
  const themesDir = path.join(cwd, 'themes');
  if (fs.existsSync(themesDir)) {
    const entries = fs.readdirSync(themesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        themes.push({
          name: entry.name,
          path: path.join(themesDir, entry.name),
          isCustom: false,
          isLegacy: false,
        });
      } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
        // Legacy single-file theme
        themes.push({
          name: entry.name.replace('.yaml', ''),
          path: path.join(themesDir, entry.name),
          isCustom: false,
          isLegacy: true,
        });
      }
    }
  }

  // Custom themes
  const customDir = path.join(cwd, 'themes-custom');
  if (fs.existsSync(customDir)) {
    const entries = fs.readdirSync(customDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        themes.push({
          name: `custom/${entry.name}`,
          path: path.join(customDir, entry.name),
          isCustom: true,
          isLegacy: false,
        });
      }
    }
  }

  return themes;
}

/**
 * Apply overrides from site.yaml to a loaded theme
 */
export function applyThemeOverrides(
  theme: FullTheme,
  overrides?: {
    features?: Partial<ThemeMeta['features']>;
    structure?: Partial<Structure>;
    blocks?: Partial<Blocks>;
    colors?: {
      light?: Partial<Colors['colors']['light']>;
      dark?: Partial<Colors['colors']['dark']>;
    };
  }
): FullTheme {
  if (!overrides) return theme;

  return {
    meta: {
      ...theme.meta,
      features: {
        ...theme.meta.features,
        ...overrides.features,
      },
    },
    structure: {
      ...theme.structure,
      header: { ...theme.structure.header, ...overrides.structure?.header },
      navigation: { ...theme.structure.navigation, ...overrides.structure?.navigation },
      layout: { ...theme.structure.layout, ...overrides.structure?.layout },
      hero: { ...theme.structure.hero, ...overrides.structure?.hero },
      footer: { ...theme.structure.footer, ...overrides.structure?.footer },
    },
    blocks: {
      ...theme.blocks,
      sidebar: overrides.blocks?.sidebar || theme.blocks.sidebar,
      sections: overrides.blocks?.sections || theme.blocks.sections,
      footerWidgets: overrides.blocks?.footerWidgets || theme.blocks.footerWidgets,
    },
    colors: {
      ...theme.colors,
      colors: {
        light: { ...theme.colors.colors.light, ...overrides.colors?.light },
        dark: { ...theme.colors.colors.dark, ...overrides.colors?.dark },
      },
    },
  };
}

/**
 * Convert FullTheme colors to legacy Theme format (for backward compatibility)
 */
export function toLegacyTheme(fullTheme: FullTheme) {
  return {
    name: fullTheme.meta.name,
    description: fullTheme.meta.description,
    colors: fullTheme.colors.colors,
    typography: fullTheme.colors.typography,
    spacing: fullTheme.colors.spacing,
    layout: {
      borderRadius: fullTheme.colors.borderRadius,
      maxWidth: fullTheme.structure.layout.maxWidth,
    },
  };
}
