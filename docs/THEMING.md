# Theme System

Complete reference for the SuperSite theme system. All visual styling is controlled from YAML configuration files, with CSS containing only structural rules and graceful fallbacks.

## Core Principle: Separation of Theming and Content

The codebase contains **zero hardcoded theme colors**. Every color reference in CSS uses `var(--variable-name)` with a fallback matching the base theme. Actual theme colors are applied at runtime by `ThemeLoader.tsx` via inline styles on `<html>`, which override the `:root` fallback declarations in `globals.css`.

This means:
- Switching themes requires only changing a YAML config value
- No CSS or code changes needed when creating or switching themes
- All themes are guaranteed compatible with the full CSS variable set

## Theme Anatomy

Each theme lives in a directory with 4 YAML files:

```
themes-custom/parchment-sky/
├── theme.yaml       # Metadata & feature toggles
├── colors.yaml      # Colors, typography, spacing, effects, animations
├── structure.yaml   # Layout: header, navigation, footer, hero
└── blocks.yaml      # Sidebar widgets, homepage sections, footer widgets
```

### Load Priority

```
themes-custom/{name}/  →  themes/{name}/  →  themes/base/
     (highest)              (standard)         (fallback)
```

Set the active theme in `config/site.local.yaml`:

```yaml
branding:
  theme: parchment-sky
```

## Color System

### Required Colors (9)

Every theme **must** define these for both `light` and `dark` palettes:

| YAML Field | CSS Variable | Purpose |
|------------|-------------|---------|
| `primary` | `--primary-color` | Brand color, links, buttons, accents |
| `secondary` | `--secondary-color` | Hover states, secondary accents |
| `text` | `--text-color` | Main body text |
| `textLight` | `--text-light` | Secondary text, descriptions, captions |
| `background` | `--background` | Page background |
| `backgroundSecondary` | `--background-secondary` | Cards, panels, code blocks |
| `border` | `--border-color` | Borders, dividers, separators |
| `success` | `--success-color` | Success states, tip callouts, green badges |
| `error` | `--error-color` | Error states, destructive actions |

### Optional Colors

| YAML Field | CSS Variable | Purpose | Fallback |
|------------|-------------|---------|----------|
| `onPrimary` | `--on-primary` | Text on primary-colored backgrounds | `#ffffff` |
| `buttonText` | `--button-text` | Button label text | `var(--on-primary)` |
| `buttonHoverText` | `--button-hover-text` | Button label on hover | `var(--on-primary)` |
| `warning` | `--warning-color` | Warning callouts, yellow badges | `#f59e0b` |
| `info` | `--info-color` | Note callouts, purple badges | `#8b5cf6` |

### Effects (in `colors.yaml`)

```yaml
effects:
  cardSurfaceTint: 4        # % of primary mixed into card backgrounds (0 = off)
  cardBorderTint: 12        # % of primary mixed into card borders (0 = off)
  cardShadow: "layered"     # none | subtle | layered | elevated
  hoverLift: true           # Cards lift on hover
  textGradient: true        # Enable primary→secondary gradient on hero text
```

| YAML Field | CSS Variable | Values |
|------------|-------------|--------|
| `cardSurfaceTint` | `--card-surface-tint` | `0%` to `100%` |
| `cardBorderTint` | `--card-border-tint` | `0%` to `100%` |
| `cardShadow` | `--card-shadow` | `none`, `subtle`, `layered`, `elevated` |
| `hoverLift` | `--hover-lift` | `0` or `1` |
| `textGradient` | `--text-gradient` | `0` or `1` |

All effects default to **off** — backward compatible. Themes opt in explicitly.

### Animations (in `colors.yaml`)

```yaml
animations:
  scrollReveal: true         # CSS scroll-driven reveal animations
  microInteractions: true    # Subtle hover/focus effects
  pageTransitions: true      # Page transition animations
  reducedMotionRespect: true # Honor prefers-reduced-motion (always true)
```

Scroll animations use CSS-only `animation-timeline: view()` behind `@supports` — progressive enhancement for Chrome/Edge, graceful no-op elsewhere.

## How ThemeLoader Works

`components/ThemeLoader.tsx` is a client component that:

1. Reads the active theme data (passed as prop from server-side loader)
2. Resolves light/dark mode (user preference → localStorage → system preference)
3. Sets `data-theme="light|dark"` on `<html>` for CSS selector targeting
4. Applies all color values as inline styles via `root.style.setProperty('--variable', value)`
5. Applies typography, spacing, border radius, and effects variables

Because inline styles have higher specificity than `:root` declarations, ThemeLoader values always win over the CSS fallbacks.

### Color Mapping

ThemeLoader maps YAML keys to CSS variable names:

```
primary       → --primary-color
secondary     → --secondary-color
text          → --text-color
textLight     → --text-light
background    → --background
backgroundSecondary → --background-secondary
border        → --border-color
success       → --success-color
error         → --error-color
warning       → --warning-color
info          → --info-color
```

Any unmapped key (e.g., `onPrimary`, `buttonText`) is auto-converted: `camelCase` → `--kebab-case`.

## Dark Mode

Each theme defines separate `light` and `dark` palettes in `colors.yaml`. Mode switching options:

| Mode | Behavior |
|------|----------|
| `light` | Always light |
| `dark` | Always dark |
| `system` | Follows `prefers-color-scheme` (default) |

User preference is stored in `localStorage('theme-mode')` and persists across sessions.

### CSS Targeting

Use `[data-theme="dark"]` selectors (not `@media (prefers-color-scheme: dark)`) for dark mode overrides in CSS modules. The `data-theme` attribute is the source of truth — it respects the user's explicit choice, not just OS preference.

## Creating a New Theme

1. Copy an existing theme as a starting point:
   ```bash
   cp -r themes/base themes-custom/my-theme
   ```

2. Edit `colors.yaml` with your palette (all 9 required colors for both light and dark)

3. Add optional colors (`onPrimary`, `warning`, `info`) for full coverage

4. Configure effects and animations (or leave them off)

5. Edit `structure.yaml` for layout preferences (header style, scroll behavior, etc.)

6. Activate in `config/site.local.yaml`:
   ```yaml
   branding:
     theme: my-theme
   ```

### Starter Template (`colors.yaml`)

```yaml
name: "My Theme"

colors:
  light:
    primary: "#2563eb"
    secondary: "#1e40af"
    text: "#1f2937"
    textLight: "#6b7280"
    background: "#ffffff"
    backgroundSecondary: "#f9fafb"
    border: "#e5e7eb"
    success: "#10b981"
    error: "#ef4444"
    onPrimary: "#ffffff"
    warning: "#f59e0b"
    info: "#8b5cf6"
  dark:
    primary: "#60a5fa"
    secondary: "#93c5fd"
    text: "#f9fafb"
    textLight: "#d1d5db"
    background: "#111827"
    backgroundSecondary: "#1f2937"
    border: "#374151"
    success: "#34d399"
    error: "#f87171"
    onPrimary: "#ffffff"
    warning: "#fbbf24"
    info: "#a78bfa"

typography:
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  fontFamilyMono: "'Fira Code', Monaco, Consolas, monospace"
  baseFontSize: "16px"

spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"

borderRadius: "8px"

effects:
  cardSurfaceTint: 0
  cardBorderTint: 0
  cardShadow: "none"
  hoverLift: false
  textGradient: false

animations:
  scrollReveal: false
  microInteractions: false
  pageTransitions: false
  reducedMotionRespect: true
```

## Schema Validation

Themes are validated at load time by Zod schemas in `lib/theme-system/schemas.ts`:

- `ColorPaletteSchema` — 9 required + 5 optional color fields
- `EffectsSchema` — all fields have defaults (off)
- `AnimationsSchema` — all fields have defaults (off)
- `ColorsSchema` — wraps colors, typography, spacing, effects, animations
- `StructureSchema` — header, navigation, layout, hero, footer
- `BlocksSchema` — sidebar widgets, sections, footer widgets
- `ThemeMetaSchema` — name, features, blog settings

Invalid themes fall back to the base theme with a console warning.

## CSS Patterns

### Using theme variables in CSS modules

```css
/* Good — uses theme variable with base-theme-matching fallback */
.myElement {
  color: var(--primary-color);
  background: var(--background-secondary);
}

/* Good — chained fallback for optional variables */
.button {
  color: var(--button-text, var(--on-primary, #ffffff));
}

/* Good — color-mix for tinted surfaces */
.card {
  background: color-mix(in srgb, var(--primary-color) 5%, var(--background));
}

/* Bad — hardcoded color */
.button {
  color: white;        /* Never do this */
  color: #3b82f6;      /* Never do this */
}
```

### Dark mode in CSS modules

```css
/* Good — uses data-theme attribute */
[data-theme="dark"] .toolbar {
  background-color: var(--background-secondary);
}

/* Bad — uses media query (ignores user preference toggle) */
@media (prefers-color-scheme: dark) {
  .toolbar { background: #1f2937; }
}
```

## Accessibility

- All animations respect `prefers-reduced-motion: reduce` via a global safety net at the top of `globals.css`
- Scroll animations are behind `@supports (animation-timeline: view())` — progressive enhancement only
- Aim for WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Current Themes

| Theme | Location | Status |
|-------|----------|--------|
| Parchment Sky | `themes-custom/parchment-sky/` | Active (warm parchment + DeepSkyBlue) |
| Clear Teal | `themes-custom/coachsteff/` | Available (teal professional) |
| Base | `themes/base/` | Fallback (blue default) |

## Key Files

| File | Purpose |
|------|---------|
| `lib/theme-system/schemas.ts` | Zod validation schemas for all theme files |
| `lib/theme-system/loader.ts` | Theme file discovery and loading (priority chain) |
| `components/ThemeLoader.tsx` | Runtime CSS variable injection + dark mode management |
| `app/globals.css` (`:root` block) | Fallback CSS variable values (match base theme) |
| `config/site.local.yaml` | `branding.theme` setting |
