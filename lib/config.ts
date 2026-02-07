import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { loadTheme, applyThemeOverrides } from './theme-loader';
import type { Theme } from './theme-schema';

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
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ChatButtonPosition = z.infer<typeof ChatButtonPositionSchema>;
export type ChatWindowPosition = z.infer<typeof ChatWindowPositionSchema>;

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

export function getActiveTheme(): Theme {
  const config = getSiteConfig();
  const themeName = config.branding.theme || 'default';
  let theme = loadTheme(themeName);
  
  // Apply user overrides
  if (config.branding.overrides) {
    theme = applyThemeOverrides(theme, config.branding.overrides as Partial<Theme>);
  }
  
  // Legacy branding support (deprecated)
  // Only show warning in development and test environments, suppressed in production
  if (config.branding.primaryColor || config.branding.secondaryColor || config.branding.fontFamily) {
    if (process.env.NODE_ENV === 'development' && !globalThis.__legacyBrandingWarned) {
      console.warn('Direct primaryColor/secondaryColor/fontFamily in config is deprecated. Use branding.theme and branding.overrides instead.');
      globalThis.__legacyBrandingWarned = true;
    }
    
    if (config.branding.primaryColor) {
      theme.colors.light.primary = config.branding.primaryColor;
    }
    if (config.branding.secondaryColor) {
      theme.colors.light.secondary = config.branding.secondaryColor;
    }
    if (config.branding.fontFamily) {
      theme.typography.fontFamily = config.branding.fontFamily;
    }
  }
  
  return theme;
}
