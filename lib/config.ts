import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';

const ChatButtonPositionSchema = z.enum(['bottom-left', 'bottom-center', 'bottom-right']);
const ChatWindowPositionSchema = z.enum(['bottom-right', 'bottom-center', 'bottom-left', 'right-docked', 'bottom-docked', 'left-docked']);
const AIProviderSchema = z.enum(['anthropic', 'openai', 'gemini', 'ollama']);

const SiteConfigSchema = z.object({
  site: z.object({
    name: z.string(),
    description: z.string(),
    logo: z.string(),
    favicon: z.string(),
    url: z.string(),
  }),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    fontFamily: z.string(),
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
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ChatButtonPosition = z.infer<typeof ChatButtonPositionSchema>;
export type ChatWindowPosition = z.infer<typeof ChatWindowPositionSchema>;

let cachedConfig: SiteConfig | null = null;

export function loadSiteConfig(): SiteConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(process.cwd(), 'config', 'site.yaml');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
  }

  const fileContents = fs.readFileSync(configPath, 'utf8');
  const rawConfig = yaml.load(fileContents);

  try {
    cachedConfig = SiteConfigSchema.parse(rawConfig);
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
  
  return {
    site: config.site,
    branding: config.branding,
    seo: {
      defaultTitle: config.seo.defaultTitle,
      titleTemplate: config.seo.titleTemplate,
      defaultDescription: config.seo.defaultDescription,
    },
    chat: {
      enabled: config.chat.enabled,
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
