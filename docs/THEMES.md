# Theme System Guide

Complete guide to creating and customizing themes in Supersite.

## Overview

Supersite's theme system uses:
- **CSS custom properties** for dynamic styling
- **YAML theme files** for easy configuration
- **5 built-in template themes**
- **Custom theme support** (user-created, gitignored)
- **Theme overrides** for quick customization

## Built-in Template Themes

### 1. Default
**Colors**: Professional blue (#2563eb)  
**Style**: Clean, modern, corporate  
**Best for**: Business sites, portfolios, professional services

```yaml
branding:
  theme: "default"
```

### 2. Modern
**Colors**: Teal/cyan (#14b8a6)  
**Style**: Contemporary, tech-forward, rounded corners  
**Best for**: Tech startups, SaaS products, modern businesses

```yaml
branding:
  theme: "modern"
```

### 3. Minimal
**Colors**: Black and white (#000000)  
**Style**: High contrast, brutalist, sharp edges  
**Best for**: Portfolios, design agencies, minimalist brands

```yaml
branding:
  theme: "minimal"
```

### 4. Dark
**Colors**: Purple/pink (#a855f7)  
**Style**: Dark-first with vibrant accents  
**Best for**: Gaming, entertainment, creative industries

```yaml
branding:
  theme: "dark"
```

### 5. Vibrant
**Colors**: Orange/green (#f97316)  
**Style**: Colorful, energetic, large border radius  
**Best for**: Marketing sites, events, lifestyle brands

```yaml
branding:
  theme: "vibrant"
```

## Using Template Themes

Select a theme in `config/site.local.yaml`:

```yaml
branding:
  theme: "modern"  # or default, minimal, dark, vibrant
```

That's it! Your entire site will use the theme's colors, typography, spacing, and layout.

## Creating Custom Themes

### Step 1: Copy a Template

```bash
cp themes/default.yaml themes-custom/my-brand.yaml
```

### Step 2: Customize the Theme

Edit `themes-custom/my-brand.yaml`:

```yaml
name: "My Brand"
description: "Custom brand theme"

colors:
  light:
    primary: "#FF6B35"          # Your brand color
    secondary: "#004E89"         # Accent color
    text: "#1c1917"             # Main text color
    textLight: "#78716c"        # Light text (descriptions, etc.)
    background: "#ffffff"        # Page background
    backgroundSecondary: "#fafaf9"  # Cards, sections
    border: "#e7e5e4"           # Borders and dividers
    success: "#22c55e"          # Success messages
    error: "#dc2626"            # Error messages
  dark:
    primary: "#fb923c"          # Dark mode primary
    secondary: "#fdba74"         # Dark mode accent
    text: "#fafaf9"             # Dark mode text
    textLight: "#d6d3d1"        # Dark mode light text
    background: "#1c1917"        # Dark mode background
    backgroundSecondary: "#292524"  # Dark mode cards
    border: "#44403c"           # Dark mode borders
    success: "#4ade80"          # Dark mode success
    error: "#f87171"            # Dark mode error

typography:
  fontFamily: "'Helvetica Neue', Arial, sans-serif"
  fontFamilyMono: "'Courier New', monospace"
  baseFontSize: "16px"

spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"

layout:
  borderRadius: "8px"          # Corner roundness
  maxWidth: "1200px"           # Max content width
```

### Step 3: Activate Your Theme

In `config/site.local.yaml`:

```yaml
branding:
  theme: "custom/my-brand"
```

## Theme Overrides

Override specific values without creating a full custom theme:

```yaml
# config/site.local.yaml
branding:
  theme: "default"
  overrides:
    colors:
      light:
        primary: "#FF6B35"      # Just change primary color
        secondary: "#004E89"
    typography:
      fontFamily: "Georgia, serif"
    layout:
      borderRadius: "12px"      # Rounder corners
```

## Theme Anatomy

### Color Palette

Each theme defines **18 colors** (9 light + 9 dark):

| Color | Purpose | Example |
|-------|---------|---------|
| `primary` | Main brand color, links, buttons | #2563eb |
| `secondary` | Accent color, hover states | #1e40af |
| `text` | Main body text | #1f2937 |
| `textLight` | Secondary text, descriptions | #6b7280 |
| `background` | Page background | #ffffff |
| `backgroundSecondary` | Cards, panels, sections | #f9fafb |
| `border` | Borders, dividers, separators | #e5e7eb |
| `success` | Success messages, positive actions | #10b981 |
| `error` | Error messages, warnings | #ef4444 |

### Typography

- **fontFamily**: Main text font (sans-serif recommended)
- **fontFamilyMono**: Code and monospace text
- **baseFontSize**: Base font size (typically 16px)

### Spacing

Six spacing levels for consistent layout:

- **xs**: Extra small (0.25rem / 4px)
- **sm**: Small (0.5rem / 8px)
- **md**: Medium (1rem / 16px)
- **lg**: Large (1.5rem / 24px)
- **xl**: Extra large (2rem / 32px)
- **xxl**: Double extra large (3rem / 48px)

### Layout

- **borderRadius**: Corner roundness (0px = sharp, 12px = very round)
- **maxWidth**: Maximum content width (1100-1280px typical)

## Automatic Dark Mode

Every theme includes dark mode colors. The system automatically switches based on user's OS preference.

**How it works**:
- OS set to light mode → uses `colors.light`
- OS set to dark mode → uses `colors.dark`

**No configuration needed** - it just works!

## Color Theory Tips

### Choosing Colors

1. **Primary color**: Your main brand color (logo color usually works)
2. **Secondary color**: Complementary or analogous to primary
3. **Text color**: High contrast with background (aim for 7:1 ratio)
4. **Background**: White/light for light mode, dark gray for dark mode

### Accessibility

Check contrast ratios at [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

- **Normal text**: 4.5:1 minimum (7:1 recommended)
- **Large text**: 3:1 minimum (4.5:1 recommended)

### Dark Mode Colors

For dark mode:
- Lighten your primary/secondary colors (increase lightness in HSL)
- Use dark grays for backgrounds (#111827, #1f2937), not pure black
- Reduce contrast slightly (pure white text can be harsh)

## Testing Your Theme

### Visual Testing

```bash
npm run dev
```

Visit:
- Homepage
- Blog posts
- Contact form
- Chat window

Check:
- All colors look good
- Text is readable
- Buttons are visible
- Dark mode works

### Theme Validation

Themes are validated with Zod schema. If your theme has errors, you'll see:

```
Error loading theme: Invalid theme schema
```

Check:
- All required fields present
- Color values are valid hex codes (#rrggbb)
- Spacing values have units (rem, px, em)

## Examples

### Corporate Theme

```yaml
name: "Corporate Blue"
colors:
  light:
    primary: "#003d82"
    secondary: "#0052a3"
    text: "#1a1a1a"
    background: "#ffffff"
    # ...
```

### Creative Theme

```yaml
name: "Creative Rainbow"
colors:
  light:
    primary: "#ff6b6b"
    secondary: "#4ecdc4"
    text: "#2d3436"
    background: "#ffffff"
    # ...
layout:
  borderRadius: "16px"  # Very round
```

### Developer Theme

```yaml
name: "Code Dark"
typography:
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
  baseFontSize: "15px"
colors:
  dark:
    primary: "#61afef"
    background: "#282c34"
    # ...
```

## FAQ

**Q: Can I use Google Fonts?**  
A: Yes! Include the font in your HTML and reference it in the theme:

```yaml
typography:
  fontFamily: "'Roboto', sans-serif"
```

**Q: How do I preview all 5 themes?**  
A: Change `branding.theme` in `config/site.local.yaml` and refresh.

**Q: Can I have different themes for different pages?**  
A: Not currently. Theme is site-wide.

**Q: Will my custom theme conflict with updates?**  
A: No! `themes-custom/` is gitignored. Template updates never touch it.

**Q: Can I share my theme?**  
A: Yes! Copy your `themes-custom/my-theme.yaml` file and share it.

**Q: How many colors can I have?**  
A: The schema requires 9 light + 9 dark. You can't add more without code changes.

## Advanced: Theme Fallbacks

Theme resolution order:

1. `themes-custom/theme-name.yaml` (user custom)
2. `themes/theme-name.yaml` (template)
3. `themes/default.yaml` (fallback)

If a theme isn't found, you'll see a warning and get the default theme.

## Resources

- [Adobe Color Wheel](https://color.adobe.com/create/color-wheel)
- [Coolors](https://coolors.co/) - Color scheme generator
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors) - Great color palettes

## Need Help?

- See `docs/CONFIGURATION.md` for configuration details
- See `docs/QUICKSTART.md` for getting started
- Run `npm run setup:theme` to see available themes
- Check theme template files in `themes/` for examples
