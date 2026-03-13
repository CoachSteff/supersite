# Handover Briefing: Complete the Markdown Directives System

## Context

We've implemented a markdown layout directive system using `remark-directive`. The foundation is working and tested — five container directives render correctly on the test page at `/test-directives`. This briefing describes what exists, what needs to be added, and the patterns to follow.

## What's Built

### Architecture

```
remark-directive (parses :::, ::, : syntax in markdown)
        ↓
lib/remarkDirectives.ts (converts AST nodes to HTML elements with data-directive attr)
        ↓
components/MarkdownContent.tsx (routes data-directive to React components via switch)
        ↓
components/directives/*.tsx (individual components)
        ↓
styles/Directives.module.css (all directive styles, uses theme CSS variables)
```

The remark plugin (`lib/remarkDirectives.ts`) already handles **all three** directive types:
- **Container** (`:::name`) → `<div data-directive="name">`
- **Leaf** (`::name`) → `<div data-directive="name">`
- **Text** (`:name`) → `<span data-directive="name">`

Attributes from the markdown syntax (e.g., `{columns=3}`) are spread as HTML attributes on the element.

### Current Directives (5 container directives)

| Directive | Component | Syntax |
|-----------|-----------|--------|
| `image-grid` | `components/directives/ImageGrid.tsx` | `:::image-grid{columns=3}` |
| `carousel` | `components/directives/Carousel.tsx` | `:::carousel` |
| `columns` | `components/directives/Columns.tsx` | `:::columns{count=2}` |
| `callout` | `components/directives/Callout.tsx` | `:::callout{type=tip}` |
| `figure` | `components/directives/Figure.tsx` | `:::figure` |

### Key Files

| File | Role |
|------|------|
| `lib/remarkDirectives.ts` | Remark plugin — transforms directive AST nodes to HTML elements. No changes needed. |
| `components/MarkdownContent.tsx` | Rendering hub — `div` override routes container/leaf directives, needs a `span` override for text directives. |
| `components/directives/index.ts` | Barrel export — add new components here. |
| `styles/Directives.module.css` | All directive styles — append new sections here. |
| `content-custom/pages/test-directives.md` | Test page — extend with new directive examples. |

### Routing in MarkdownContent.tsx

Container and leaf directives are routed via the `div` component override:
```tsx
div: ({ node, children, ...props }: any) => {
  const directive = props['data-directive'];
  if (directive) {
    switch (directive) {
      case 'image-grid': return <ImageGrid {...props}>{children}</ImageGrid>;
      case 'carousel': return <Carousel {...props}>{children}</Carousel>;
      // ... add new cases here
    }
  }
  return <div {...props}>{children}</div>;
}
```

Text directives need a NEW `span` override (not yet added):
```tsx
span: ({ node, children, ...props }: any) => {
  const directive = props['data-directive'];
  if (directive) {
    switch (directive) {
      case 'highlight': return <Highlight {...props}>{children}</Highlight>;
      // ... etc
    }
  }
  return <span {...props}>{children}</span>;
}
```

## What to Add

### Container Directives (`:::name`)

**Accordion / Details** — collapsible sections:
```markdown
:::details{summary="Click to expand"}
Hidden content goes here with full **markdown** support.
:::
```
- Uses native `<details>` + `<summary>` HTML elements
- The `summary` attribute becomes the clickable header
- Content is the collapsible body
- Optionally support `{open}` attribute to start expanded
- Styled with theme variables for consistency

**Tabs** — tabbed content panels:
```markdown
:::tabs
:::tab{label="First"}
Content of the first tab.
:::

:::tab{label="Second"}
Content of the second tab.
:::
:::
```
- Outer `:::tabs` container manages active tab state
- Inner `:::tab{label="..."}` defines each panel
- Needs `'use client'` for tab switching state
- Note: nested container directives work in remark-directive — the outer container gets the inner containers as children

**Card** — styled content card:
```markdown
:::card
![Header image](/images/photo.jpg)
### Card Title
Card body text with markdown support.
:::
```
- Styled surface with theme `--border-radius`, `--border-color`, subtle shadow
- First image becomes the card header (full-width, no border radius on top)
- First heading becomes the card title
- Rest becomes the card body
- Works well inside `:::columns` for card grids

**Steps** — numbered step-by-step instructions:
```markdown
:::steps
### Step One
Do this first thing.

### Step Two
Then do this next thing.

### Step Three
Finally, do this.
:::
```
- Splits on `<h3>` elements (each heading starts a new step)
- Auto-numbers each step with a styled counter
- Vertical line connecting the steps (timeline style)
- Headings become step titles, content below each heading becomes step body

### Leaf Directives (`::name`)

These are single-line, no content body. The remark plugin already transforms them to `<div>` elements.

**YouTube embed:**
```markdown
::youtube{id=dQw4w9WgXcQ}
```
- Renders a responsive 16:9 iframe
- Only needs the video `id` attribute
- Use `loading="lazy"` on the iframe
- Optional: `{title="Video title"}` for accessibility

**Button / CTA:**
```markdown
::button{href=/contact label="Get in touch"}
```
- Renders a styled link that looks like a button
- Uses `href` for the link destination, `label` for the text
- Optional `{variant=primary}` or `{variant=secondary}` for styling
- Centered by default

**Spacer:**
```markdown
::spacer{size=xl}
```
- Just vertical whitespace
- Maps `size` to spacing variables: `sm`, `md`, `lg`, `xl`, `xxl`
- Useful between sections for visual breathing room

**Divider:**
```markdown
::divider{style=dots}
```
- Decorative section break (fancier than `---`)
- Styles: `dots`, `wave`, `gradient`, `fade`
- Centered, uses theme colors

### Text Directives (`:name`)

These are inline — they appear inside paragraphs. The remark plugin transforms them to `<span>` elements. **Requires adding a `span` component override in MarkdownContent.tsx** (see routing section above).

Syntax: `:name[content]{attributes}`

**Highlight:**
```markdown
This is :highlight[important text]{color=yellow} in a sentence.
```
- Wraps text in a `<mark>` element with a colored background
- Colors: `yellow` (default), `green`, `blue`, `pink`
- Semi-transparent background so it looks like a highlighter

**Badge:**
```markdown
Status: :badge[Published]{color=green}
```
- Inline pill/tag
- Colors: `green`, `blue`, `yellow`, `red`, `gray`
- Small, rounded, colored background with contrasting text

**Keyboard shortcut:**
```markdown
Press :kbd[Ctrl+S] to save.
```
- Styled like a keyboard key
- Monospace font, bordered box, slight shadow to look raised
- Splits on `+` to style each key separately (optional enhancement)

**Abbreviation:**
```markdown
The :abbr[CAF]{title="Cognitive Agility Framework"} defines five capabilities.
```
- Renders as `<abbr>` with a `title` attribute (browser shows tooltip on hover)
- Dotted underline to indicate the tooltip
- Accessible by default

## Patterns and Gotchas

### Image extraction from paragraphs

When images are written without blank lines between them inside a directive, markdown wraps them ALL in a single `<p>` tag. The `ImageGrid` and `Carousel` components handle this by extracting individual `<img>` elements from paragraph wrappers using `extractImages()` / `extractSlides()` helper functions. **New image-heavy directives should use the same pattern.** See `components/directives/ImageGrid.tsx` for the reference implementation.

### The `children` prop

Directive components receive `children` from react-markdown. These are already-rendered React elements (not raw markdown). So:
- A paragraph in the directive becomes a `<p>` React element
- Bold text becomes `<strong>`
- Images become `<img>`
- A `---` becomes an `<hr>` (used by Columns to split into columns)
- Headings become `<h1>`, `<h2>`, `<h3>`, etc.

You can inspect child types with `child?.type` (returns the element tag as a string, e.g., `'p'`, `'img'`, `'hr'`, `'h3'`).

### `'use client'` directive

Only add `'use client'` to components that need React state or effects (like Carousel with its scroll tracking). Pure presentational components (ImageGrid, Columns, Callout, Figure) don't need it.

### Inline code detection fix

The `code` component override in MarkdownContent.tsx uses this detection:
```tsx
const isInline = inline || (!className && !code.includes('\n'));
```
This was needed because react-markdown's `inline` prop isn't always reliable. Don't change this — it prevents `<pre>` from rendering inside `<p>` (hydration error).

### CSS variables available

All components should use theme CSS variables for automatic light/dark mode:
- `--primary-color`, `--secondary-color`
- `--text-color`, `--text-light`
- `--background-color`, `--background-secondary`
- `--border-color`, `--border-radius`
- `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`, `--spacing-xxl`
- `--font-heading`, `--font-family-mono`

### Responsive breakpoint

All existing directives use `768px` as the mobile breakpoint, matching `styles/Content.module.css`. Keep this consistent.

### Adding a new directive — checklist

1. Create `components/directives/NewDirective.tsx`
2. Export from `components/directives/index.ts`
3. Add `case` to the `switch` in `MarkdownContent.tsx` (in `div` override for container/leaf, or `span` override for text)
4. Add styles to `styles/Directives.module.css`
5. Add examples to `content-custom/pages/test-directives.md`
6. Test with `npm run dev` and verify on `/test-directives`
7. Run `npm run build` to confirm no type errors

## Test Page

The test page lives at `content-custom/pages/test-directives.md` and is accessible at `/test-directives`. Extend it with examples for every new directive. This page serves as both a visual test and documentation for content authors.

## Build Notes

- `npm run dev` runs on port 3001
- `npm run build` should produce zero type errors (38 pages)
- Dynamic route warnings during build are pre-existing and normal (API routes using cookies/unstable_noStore)
- After adding new remark plugins or changing MarkdownContent.tsx, restart the dev server — hot reload doesn't always pick up plugin changes cleanly
