import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { unstable_noStore as noStore } from 'next/cache';
import { loadTheme, applyThemeOverrides, type FullTheme } from './theme-system';

const ChatButtonPositionSchema = z.enum(['bottom-left', 'bottom-center', 'bottom-right']);
const ChatWindowPositionSchema = z.enum(['bottom-right', 'bottom-center', 'bottom-left', 'right-docked', 'bottom-docked', 'left-docked']);
const AIProviderSchema = z.enum(['anthropic', 'openai', 'gemini', 'ollama']);

const ContentConfigSchema = z.object({
  customDirectory: z.string().optional(),
  templateDirectory: z.string().default('content'),
});

const ThemeOverridesSchema = z.object({
  colors: z.object({
    light: z.record(z.string(), z.string()).optional(),
    dark: z.record(z.string(), z.string()).optional(),
  }).optional(),
  typography: z.record(z.string(), z.string()).optional(),
  spacing: z.record(z.string(), z.string()).optional(),
  layout: z.record(z.string(), z.string()).optional(),
  structure: z.object({
    chatLayout: z.enum(['popup', 'center', 'sidebar']).optional(),
  }).optional(),
}).optional();

const MultilingualConfigSchema = z.object({
  enabled: z.boolean().default(true),
  defaultLanguage: z.string().default('en'),
  supportedLanguages: z.array(z.string()).default(['en', 'nl', 'fr']),
  useAiTranslation: z.boolean().default(true),
  caching: z.object({
    enabled: z.boolean().default(true),
    strategy: z.enum(['memory', 'filesystem']).default('filesystem'),
    directory: z.string().default('.cache/translations'),
  }).optional(),
  seo: z.object({
    generateHreflang: z.boolean().default(true),
  }).optional(),
}).optional();

const SiteConfigSchema = z.object({
  site: z.object({
    name: z.string(),
    description: z.string(),
    logo: z.string(),
    favicon: z.string(),
    url: z.string(),
  }),
  branding: z.object({
    theme: z.string().default('default'),
    primaryUser: z.string().optional(),
    overrides: ThemeOverridesSchema,
    // Legacy support (deprecated but functional)
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }),
  seo: z.object({
    defaultTitle: z.string(),
    titleTemplate: z.string(),
    defaultDescription: z.string(),
    ogImage: z.string(),
    twitterHandle: z.string().optional(),
  }),
  navigation: z.object({
    autoGenerate: z.boolean(),
    customLinks: z.array(z.object({
      title: z.string(),
      path: z.string(),
    })).optional(),
  }),
  chat: z.object({
    enabled: z.boolean(),
    provider: AIProviderSchema,
    model: z.string(),
    systemPrompt: z.string(),
    temperature: z.number(),
    maxTokens: z.number(),
    // AI-First Features
    streaming: z.boolean().optional().default(true),
    voice: z.object({
      enabled: z.boolean().optional().default(true),
      language: z.string().optional().default('en-US'),
    }).optional(),
    actions: z.object({
      enabled: z.boolean().optional().default(true),
      allowNavigation: z.boolean().optional().default(true),
      allowSearch: z.boolean().optional().default(true),
      allowExternalLinks: z.boolean().optional().default(true),
    }).optional(),
    memory: z.object({
      enabled: z.boolean().optional().default(true),
      maxMessages: z.number().optional().default(50),
    }).optional(),
    shortcuts: z.object({
      enabled: z.boolean().optional().default(true),
      openChat: z.string().optional().default('mod+k'),
    }).optional(),
    suggestions: z.object({
      enabled: z.boolean().optional().default(true),
      maxSuggestions: z.number().optional().default(3),
    }).optional(),
    multilingual: z.object({
      enabled: z.boolean().optional().default(true),
      fallbackLanguage: z.string().optional().default('en'),
      autoDetect: z.boolean().optional().default(true),
    }).optional(),
    button: z.object({
      position: ChatButtonPositionSchema,
      offsetX: z.number(),
      offsetY: z.number(),
      icon: z.string(),
    }),
    window: z.object({
      position: ChatWindowPositionSchema,
      width: z.number(),
      height: z.number(),
      layout: z.enum(['popup', 'center', 'sidebar']).optional(),
    }),
    welcomeMessage: z.string(),
    placeholder: z.string(),
  }),
  features: z.object({
    search: z.boolean(),
    blog: z.boolean(),
    contactForm: z.boolean(),
    analytics: z.boolean(),
  }),
  content: ContentConfigSchema.optional(),
  social: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  profile: z.object({
    name: z.string(),
    title: z.string().optional(),
    bio: z.string().optional(),
    image: z.string().optional(),
    location: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  hero: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
  }).optional(),
  admin: z.object({
    toolbar: z.boolean().optional().default(false),
  }).optional(),
  auth: z.object({
    enabled: z.boolean().default(false),
    requireApproval: z.boolean().optional().default(false),
  }).optional(),
  multilingual: MultilingualConfigSchema,
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ChatButtonPosition = z.infer<typeof ChatButtonPositionSchema>;
export type ChatWindowPosition = z.infer<typeof ChatWindowPositionSchema>;

// No caching in development for hot-reload support
const isDev = process.env.NODE_ENV === 'development';
let cachedConfig: SiteConfig | null = null;

// Deep merge utility (simple object merge)
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

export function loadSiteConfig(): SiteConfig {
  // Prevent Next.js from caching this function's result
  noStore();
  
  // Always reload in development
  if (isDev) {
    cachedConfig = null;
  }
  
  if (cachedConfig) {
    return cachedConfig;
  }

  const configDir = path.join(process.cwd(), 'config');
  const templateConfigPath = path.join(configDir, 'site.yaml');
  const userConfigPath = path.join(configDir, 'site.local.yaml');
  
  // Load template config (required)
  if (!fs.existsSync(templateConfigPath)) {
    throw new Error(`Template configuration file not found at ${templateConfigPath}`);
  }

  const templateContents = fs.readFileSync(templateConfigPath, 'utf8');
  const templateConfig = yaml.load(templateContents) as Record<string, unknown>;

  // Load user config (optional)
  let userConfig: Record<string, unknown> = {};
  if (fs.existsSync(userConfigPath)) {
    const userContents = fs.readFileSync(userConfigPath, 'utf8');
    userConfig = (yaml.load(userContents) as Record<string, unknown>) || {};
  }

  // Deep merge: template ← user overrides
  const mergedConfig = deepMerge(templateConfig, userConfig);

  try {
    cachedConfig = SiteConfigSchema.parse(mergedConfig);
    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation error:', error.issues);
      throw new Error('Invalid configuration file. Check the YAML schema.');
    }
    throw error;
  }
}

export function getSiteConfig(): SiteConfig {
  return loadSiteConfig();
}

export function getClientSafeConfig() {
  const config = getSiteConfig();
  const theme = getActiveTheme();
  
  return {
    site: config.site,
    branding: {
      theme: config.branding.theme,
      // Expose theme colors for client-side use
      colors: theme.colors,
    },
    seo: {
      defaultTitle: config.seo.defaultTitle,
      titleTemplate: config.seo.titleTemplate,
      defaultDescription: config.seo.defaultDescription,
    },
    chat: {
      enabled: config.chat.enabled,
      streaming: config.chat.streaming,
      voice: config.chat.voice,
      actions: config.chat.actions,
      memory: config.chat.memory,
      shortcuts: config.chat.shortcuts,
      suggestions: config.chat.suggestions,
      button: config.chat.button,
      window: config.chat.window,
      welcomeMessage: config.chat.welcomeMessage,
      placeholder: config.chat.placeholder,
    },
    features: config.features,
    admin: config.admin,
  };
}

export function validateConfig(): boolean {
  try {
    loadSiteConfig();
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
}

// Cache for loaded theme
let cachedFullTheme: FullTheme | null = null;

export function getActiveTheme(): FullTheme {
  // Prevent Next.js from caching this function's result
  noStore();
  
  // Always reload in development
  if (isDev) {
    cachedFullTheme = null;
  }
  
  const config = getSiteConfig();
  const themeName = config.branding.theme || 'base';
  
  // Load new folder-based theme system
  const { theme: fullTheme, errors } = loadTheme(themeName);
  
  if (errors.length > 0 && process.env.NODE_ENV === 'development') {
    errors.forEach(err => console.warn(`[Theme] ${err}`));
  }

  // Apply config overrides if present
  let finalTheme = fullTheme;
  if (config.branding.overrides) {
    finalTheme = applyThemeOverrides(fullTheme, config.branding.overrides);
  }
  
  // Legacy branding support (deprecated but still functional)
  if (config.branding.primaryColor || config.branding.secondaryColor || config.branding.fontFamily) {
    if (process.env.NODE_ENV === 'development' && !globalThis.__legacyBrandingWarned) {
      console.warn('Direct primaryColor/secondaryColor/fontFamily in config is deprecated. Use branding.theme and branding.overrides instead.');
      globalThis.__legacyBrandingWarned = true;
    }
    
    // Apply legacy branding as overrides
    const legacyOverrides: Record<string, unknown> = { colors: { light: {}, dark: {} } };
    if (config.branding.primaryColor) {
      (legacyOverrides.colors as Record<string, Record<string, string>>).light.primary = config.branding.primaryColor;
    }
    if (config.branding.secondaryColor) {
      (legacyOverrides.colors as Record<string, Record<string, string>>).light.secondary = config.branding.secondaryColor;
    }
    if (config.branding.fontFamily) {
      legacyOverrides.typography = { fontFamily: config.branding.fontFamily };
    }
    
    finalTheme = applyThemeOverrides(finalTheme, legacyOverrides);
  }

  // Cache for getActiveFullTheme()
  cachedFullTheme = finalTheme;
  
  return finalTheme;
}

/**
 * Get the full theme with structure, blocks, and features
 * Alias for getActiveTheme() for backward compatibility
 */
export function getActiveFullTheme(): FullTheme {
  return getActiveTheme();
}

/**
 * Validate if a username exists and return validation result
 */
export function validatePrimaryUser(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Primary user cannot be empty' };
  }

  // Import getUserByUsername dynamically to avoid circular dependency
  const { getUserByUsername } = require('./users');
  const user = getUserByUsername(username);
  
  if (!user) {
    return { valid: false, error: `User "${username}" does not exist. Create this user account first.` };
  }

  return { valid: true };
}

/**
 * Get the primary user profile for the site (used by Influencer theme homepage)
 * Returns null if no primary user is set or if the user doesn't exist
 */
export function getPrimaryUser(): any | null {
  const config = getSiteConfig();
  const primaryUsername = config.branding.primaryUser;

  if (!primaryUsername) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Config] No primaryUser set in branding config. Influencer theme homepage will show fallback message.');
    }
    return null;
  }

  const validation = validatePrimaryUser(primaryUsername);
  if (!validation.valid) {
    console.error(`[Config] Primary user validation failed: ${validation.error}`);
    return null;
  }

  // Import getPublicProfile dynamically to avoid circular dependency
  const { getPublicProfile } = require('./users');
  return getPublicProfile(primaryUsername);
}
