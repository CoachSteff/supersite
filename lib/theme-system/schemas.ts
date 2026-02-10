import { z } from 'zod';

// ============================================
// THEME.YAML - Metadata & Features
// ============================================

export const FeaturesSchema = z.object({
  search: z.boolean().default(true),
  chat: z.boolean().default(true),
  darkMode: z.boolean().default(true),
  auth: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  comments: z.boolean().default(false),
  socialShare: z.boolean().default(true),
}).default({
  search: true,
  chat: true,
  darkMode: true,
  auth: false,
  newsletter: false,
  comments: false,
  socialShare: true,
});

export const BlogFeaturesSchema = z.object({
  readingTime: z.boolean().default(true),
  tableOfContents: z.boolean().default(false),
  relatedPosts: z.boolean().default(true),
});

export const ThemeMetaSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  features: FeaturesSchema,
  blog: BlogFeaturesSchema.optional(),
  defaultColors: z.string().default('colors.yaml'),
});

export type ThemeMeta = z.infer<typeof ThemeMetaSchema>;
export type Features = z.infer<typeof FeaturesSchema>;

// ============================================
// STRUCTURE.YAML - Layout & Structure
// ============================================

export const HeaderStyleSchema = z.enum(['full', 'minimal', 'centered', 'none']);
export const LayoutTypeSchema = z.enum(['full-width', 'centered', 'sidebar-left', 'sidebar-right']);
export const NavigationStyleSchema = z.enum(['horizontal', 'vertical', 'hamburger', 'none']);
export const NavigationPositionSchema = z.enum(['header', 'sidebar', 'footer']);
export const HeroTypeSchema = z.enum(['none', 'text', 'image', 'featured-post', 'profile', 'chat']);
export const FooterStyleSchema = z.enum(['full', 'minimal', 'centered', 'none']);
export const ChatLayoutSchema = z.enum(['popup', 'center', 'sidebar']);

export const HeaderSchema = z.object({
  enabled: z.boolean().default(true),
  style: HeaderStyleSchema.default('full'),
  sticky: z.boolean().default(true),
  logo: z.boolean().default(true),
  search: z.boolean().default(true),
  themeToggle: z.boolean().default(true),
  auth: z.boolean().default(false),
}).default({
  enabled: true,
  style: 'full',
  sticky: true,
  logo: true,
  search: true,
  themeToggle: true,
  auth: false,
});

export const NavigationSchema = z.object({
  style: NavigationStyleSchema.default('horizontal'),
  position: NavigationPositionSchema.default('header'),
  showIcons: z.boolean().default(false),
}).default({
  style: 'horizontal',
  position: 'header',
  showIcons: false,
});

export const LayoutSchema = z.object({
  type: LayoutTypeSchema.default('full-width'),
  maxWidth: z.string().default('1200px'),
  contentWidth: z.string().default('800px'),
  sidebarWidth: z.string().default('300px'),
}).default({
  type: 'full-width',
  maxWidth: '1200px',
  contentWidth: '800px',
  sidebarWidth: '300px',
});

export const HeroSchema = z.object({
  enabled: z.boolean().default(false),
  type: HeroTypeSchema.default('none'),
  height: z.string().default('auto'),
}).default({
  enabled: false,
  type: 'none',
  height: 'auto',
});

export const FooterSchema = z.object({
  enabled: z.boolean().default(true),
  style: FooterStyleSchema.default('minimal'),
}).default({
  enabled: true,
  style: 'minimal',
});

export const StructureSchema = z.object({
  header: HeaderSchema,
  navigation: NavigationSchema,
  layout: LayoutSchema,
  hero: HeroSchema,
  footer: FooterSchema,
  chatLayout: ChatLayoutSchema.optional().default('popup'),
});

export type Structure = z.infer<typeof StructureSchema>;

// ============================================
// BLOCKS.YAML - Widgets & Sections
// ============================================

export const SidebarWidgetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('search') }),
  z.object({ 
    type: z.literal('about'),
    title: z.string().optional(),
    content: z.string().optional(),
    image: z.string().optional(),
  }),
  z.object({ 
    type: z.literal('categories'),
    title: z.string().optional(),
    limit: z.number().optional(),
  }),
  z.object({ 
    type: z.literal('tags'),
    title: z.string().optional(),
    limit: z.number().default(20),
  }),
  z.object({ 
    type: z.literal('recent-posts'),
    title: z.string().optional(),
    limit: z.number().default(5),
  }),
  z.object({ 
    type: z.literal('newsletter'),
    title: z.string().optional(),
    description: z.string().optional(),
    placeholder: z.string().default('your@email.com'),
    buttonText: z.string().default('Subscribe'),
  }),
  z.object({ 
    type: z.literal('social-links'),
    title: z.string().optional(),
  }),
  z.object({ 
    type: z.literal('custom'),
    title: z.string().optional(),
    content: z.string(),
  }),
]);

export const SectionSchema = z.object({
  type: z.enum(['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta', 'team', 'custom']),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.any().optional(),
});

export const FooterWidgetSchema = z.object({
  type: z.enum(['copyright', 'social-links', 'nav-links', 'custom']),
  content: z.string().optional(),
});

export const BlocksSchema = z.object({
  sidebar: z.array(SidebarWidgetSchema).default([]),
  sections: z.array(SectionSchema).default([]),
  footerWidgets: z.array(FooterWidgetSchema).default([]),
});

export type Blocks = z.infer<typeof BlocksSchema>;
export type SidebarWidget = z.infer<typeof SidebarWidgetSchema>;
export type Section = z.infer<typeof SectionSchema>;

// ============================================
// COLORS.YAML - Appearance
// ============================================

export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  text: z.string(),
  textLight: z.string(),
  background: z.string(),
  backgroundSecondary: z.string(),
  border: z.string(),
  success: z.string(),
  error: z.string(),
});

export const TypographySchema = z.object({
  fontFamily: z.string().default('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'),
  fontFamilyMono: z.string().default('"Fira Code", "Monaco", Consolas, monospace'),
  baseFontSize: z.string().default('16px'),
}).default({
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMono: '"Fira Code", "Monaco", Consolas, monospace',
  baseFontSize: '16px',
});

export const SpacingSchema = z.object({
  xs: z.string().default('0.25rem'),
  sm: z.string().default('0.5rem'),
  md: z.string().default('1rem'),
  lg: z.string().default('1.5rem'),
  xl: z.string().default('2rem'),
  xxl: z.string().default('3rem'),
}).default({
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
});

export const ColorsSchema = z.object({
  name: z.string().optional(),
  colors: z.object({
    light: ColorPaletteSchema,
    dark: ColorPaletteSchema,
  }),
  typography: TypographySchema,
  spacing: SpacingSchema,
  borderRadius: z.string().default('4px'),
});

export type Colors = z.infer<typeof ColorsSchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type Spacing = z.infer<typeof SpacingSchema>;

// ============================================
// COMBINED THEME
// ============================================

export const FullThemeSchema = z.object({
  meta: ThemeMetaSchema,
  structure: StructureSchema,
  blocks: BlocksSchema,
  colors: ColorsSchema,
});

export type FullTheme = z.infer<typeof FullThemeSchema>;
