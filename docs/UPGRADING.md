# Upgrading to SuperSite 0.2.0

This guide helps you upgrade from version 0.1.x to 0.2.0.

## Breaking Changes

### 1. Chat Component Renames

The enhanced chat components have been promoted to the main components:

**Before (0.1.x):**
```typescript
import ChatProvider from '@/components/ChatProviderEnhanced';
import ChatWindow from '@/components/ChatWindowEnhanced';
```

**After (0.2.0):**
```typescript
import ChatProvider from '@/components/ChatProvider';
import ChatWindow from '@/components/ChatWindow';
```

**Action Required:**
- If you have custom code importing chat components, update the import paths
- Remove any references to legacy `ChatProvider.tsx` or `ChatWindow.tsx`
- The legacy components have been removed from the codebase

### 2. Theme System Changes

The single-file theme system has been replaced with folder-based themes.

**Before (0.1.x):**
- Themes were single YAML files: `themes/default.yaml`, `themes/modern.yaml`
- Theme structure was flat

**After (0.2.0):**
- Themes are in folders: `themes/base/`, `themes/blog/`, `themes/business/`
- Each theme has `colors.yaml` and `structure.yaml`
- More granular control over theming

**Action Required:**
- If you created custom themes in 0.1.x format, migrate to folder structure
- See `themes/base/` for reference structure
- Update `branding.theme` in your config to use new theme names

**Migration Example:**
```yaml
# Old (0.1.x)
branding:
  theme: modern

# New (0.2.0)
branding:
  theme: business  # or base, blog, chatbot, community, influencer
```

### 3. Theme Loader Function

The `getActiveTheme()` function now returns `FullTheme` directly.

**Before (0.1.x):**
```typescript
const theme = getActiveTheme();        // Returns legacy Theme type
const fullTheme = getActiveFullTheme(); // Returns FullTheme
```

**After (0.2.0):**
```typescript
const theme = getActiveTheme();  // Now returns FullTheme directly
```

**Action Required:**
- If you have custom code calling `getActiveFullTheme()`, use `getActiveTheme()` instead
- Update type annotations from `Theme` to `FullTheme` if needed

## New Features

### 1. Internationalization

Version 0.2.0 adds comprehensive multi-language support.

**New Configuration:**
```yaml
multilingual:
  enabled: true
  supportedLanguages: [en, nl, fr, de, es, it, pt]
  defaultLanguage: en
  useAiTranslation: true
  caching:
    enabled: true
    directory: .cache/translations

features:
  languageSwitcher: true
```

**New Files:**
- `middleware.ts` - Language routing (required for multi-language)
- `lib/language-detector.ts` - Language detection utilities
- `lib/translation-service.ts` - AI translation with caching

**Action Required:**
- Add `middleware.ts` to your project if missing
- Configure supported languages in your `site.local.yaml`
- Enable `features.languageSwitcher` to show language selector

### 2. Favourites/Bookmarking System

Users can now bookmark pages and blog posts.

**New Configuration:**
```yaml
features:
  favorites: true
```

**New Files:**
- `app/favourites/page.tsx` - Favourites management page
- `app/api/favorites/route.ts` - Favourites API
- `components/FavouritesList.tsx` - Favourites UI component

**Action Required:**
- Enable `features.favorites` in your config to activate the feature
- The `/favourites` route is automatically available when enabled

### 3. Loading States

Improved loading indicators for better UX.

**New Files:**
- `app/loading.tsx` - Global loading component
- `app/blog/loading.tsx` - Blog-specific loading

**Action Required:**
- No action needed, loading states work automatically

## Configuration Changes

### New Schema Fields

The configuration schema has been extended:

```yaml
features:
  favorites: true          # NEW: Enable bookmarking
  languageSwitcher: true   # NEW: Show language selector

multilingual:              # NEW: Entire section
  enabled: true
  supportedLanguages: [en, nl, fr]
  defaultLanguage: en
  useAiTranslation: true
  caching:
    enabled: true
    directory: .cache/translations
```

**Action Required:**
- Review new configuration options
- Add desired features to your `site.local.yaml`
- All new features are optional and backward compatible

## Dependencies

### New Dependencies

Version 0.2.0 does not add new npm dependencies. All existing dependencies from 0.1.x are sufficient.

**Verify Your Dependencies:**
```bash
npm install
```

All translation and language detection is handled by existing libraries (`gray-matter`, `remark`, `remark-html`) and AI providers.

## Migration Steps

### Step 1: Backup Your Customizations

```bash
# Backup your local config
cp config/site.local.yaml config/site.local.yaml.backup

# Backup custom content
cp -r content-custom content-custom.backup

# Backup custom themes (if any)
cp -r themes-custom themes-custom.backup
```

### Step 2: Update Code

```bash
# Pull latest changes
git pull origin main

# Install dependencies (verify no issues)
npm install
```

### Step 3: Update Imports (If Applicable)

If you have custom code importing chat components:

```bash
# Search for legacy imports
grep -r "ChatProviderEnhanced\|ChatWindowEnhanced" .
```

Update any matches to use the new names.

### Step 4: Migrate Custom Themes (If Applicable)

If you created custom themes in 0.1.x:

1. Create folder structure: `themes-custom/mytheme/`
2. Split theme into `colors.yaml` and `structure.yaml`
3. See `themes/base/` for reference
4. Update config to point to new theme

### Step 5: Test Your Site

```bash
# Start development server
npm run dev

# Test critical flows:
# - Homepage loads
# - Chat works
# - Navigation works
# - Blog works
# - Your custom features work
```

### Step 6: Enable New Features (Optional)

Update your `config/site.local.yaml`:

```yaml
# Enable internationalization
multilingual:
  enabled: true
  supportedLanguages: [en, nl, fr]

# Enable bookmarking
features:
  favorites: true
  languageSwitcher: true
```

Test each feature as you enable it.

## Rollback Plan

If you encounter issues:

### Option 1: Restore Backups

```bash
# Restore config
cp config/site.local.yaml.backup config/site.local.yaml

# Restore content
rm -rf content-custom
cp -r content-custom.backup content-custom
```

### Option 2: Revert to 0.1.x

```bash
# Check out previous version
git checkout v0.1.0-alpha.2

# Reinstall dependencies
npm install
```

## Getting Help

If you encounter issues during upgrade:

1. Check [CONFIGURATION.md](./CONFIGURATION.md) for configuration reference
2. Review [CHANGELOG.md](../CHANGELOG.md) for complete list of changes
3. Open an issue on [GitHub](https://github.com/coachsteff/supersite/issues)

## Summary

**Required Actions:**
- ✅ Update chat component imports (if you have custom code)
- ✅ Migrate custom themes to folder structure (if applicable)
- ✅ Add `middleware.ts` for internationalization (if enabling)

**Optional Enhancements:**
- Enable internationalization for multi-language support
- Enable favourites for bookmarking functionality
- Explore new theme options

**Backward Compatibility:**
- All 0.1.x configurations continue working
- New features are opt-in
- No forced breaking changes for basic usage

Welcome to SuperSite 0.2.0! 🎉
