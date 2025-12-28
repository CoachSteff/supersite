import { z } from 'zod';

const ColorPaletteSchema = z.object({
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

const TypographySchema = z.object({
  fontFamily: z.string(),
  fontFamilyMono: z.string(),
  baseFontSize: z.string(),
});

const SpacingSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  xxl: z.string(),
});

const LayoutSchema = z.object({
  borderRadius: z.string(),
  maxWidth: z.string(),
});

export const ThemeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  colors: z.object({
    light: ColorPaletteSchema,
    dark: ColorPaletteSchema,
  }),
  typography: TypographySchema,
  spacing: SpacingSchema,
  layout: LayoutSchema,
});

export type Theme = z.infer<typeof ThemeSchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type Spacing = z.infer<typeof SpacingSchema>;
export type Layout = z.infer<typeof LayoutSchema>;
