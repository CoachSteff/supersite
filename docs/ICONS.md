# Icon Usage Guide

This website uses [Lucide React](https://lucide.dev/) for icons. Below are the icons currently in use and how to add more.

## Current Icons

### Header Component
- `Search` - Search button icon

### Search Component
- `Search` - Search input icon
- `X` - Close button icon
- `FileText` - Page result icon
- `BookOpen` - Blog post result icon

### Blog Components
- `Calendar` - Date/timestamp icon
- `Tag` - Tag icon
- `ArrowRight` - Read more link icon

## Adding New Icons

1. Import the icon from `lucide-react`:
```tsx
import { IconName } from 'lucide-react';
```

2. Use the icon in your component:
```tsx
<IconName size={20} />
```

## Customization

### Size
Change the `size` prop (in pixels):
```tsx
<Search size={16} />  // Small
<Search size={20} />  // Default
<Search size={24} />  // Large
```

### Color
Icons inherit color from CSS. To customize:
```tsx
<Search className={styles.myIcon} />
```

```css
.myIcon {
  color: var(--primary-color);
}
```

### Stroke Width
Adjust icon weight:
```tsx
<Search strokeWidth={1.5} />  // Lighter
<Search strokeWidth={2} />    // Default
<Search strokeWidth={2.5} />  // Heavier
```

## Common Icons You Might Need

- `Menu` / `X` - Mobile menu toggle
- `ChevronDown` - Dropdown indicators
- `Mail` - Email/contact
- `ExternalLink` - External links
- `User` - User/profile
- `Home` - Homepage link
- `FileText` - Documents/pages
- `BookOpen` - Blog/articles
- `Settings` - Configuration
- `Share2` - Social sharing

## Available Icon Sets

Browse all available icons at: https://lucide.dev/icons/

Categories include:
- Arrows & Navigation
- Communication
- Files & Folders
- Media & Devices
- User Interface
- Weather
- And many more...
