# Migration Guide

## v0.1.0-alpha.2: Folder Restructuring

This guide helps you migrate from the old structure to the new folder organization.

### What Changed

**Old Structure:**
```
supersite/
├── config/
│   ├── site.yaml           # Template config
│   └── site.local.yaml     # User config (gitignored)
├── content/                # Template content
├── content-custom/         # User content (gitignored)
├── themes/                 # Template themes
├── themes-custom/          # User themes (gitignored)
├── app/                    # Next.js app
├── components/             # React components
├── lib/                    # Utilities
└── ...
```

**New Structure:**
```
supersite/
├── core/                   # Framework (GitHub-tracked)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── templates/              # Examples (GitHub-tracked)
│   ├── content/
│   ├── themes/
│   └── config.yaml
├── site/                   # Your workspace (git-ignored)
│   ├── content/
│   ├── themes/
│   └── config.yaml
└── ...
```

### Why This Change?

1. **Cleaner separation**: Core framework vs. user content
2. **Easier updates**: `git pull` never touches your `site/` directory
3. **Better organization**: All user files in one place
4. **More intuitive**: Similar to CMS systems like Drupal

### Migration Steps

#### Automatic Migration (Recommended)

We've created a migration script to automate this process:

```bash
npm run migrate
```

This script will:
1. Detect your old content and configuration
2. Create the new `site/` directory
3. Copy your content to the new location
4. Create backups of old directories
5. Show you a summary of changes

#### Manual Migration

If you prefer to migrate manually:

1. **Create site directory:**
```bash
mkdir -p site/content site/themes
```

2. **Migrate your configuration:**
```bash
# If you have site.local.yaml
cp config/site.local.yaml site/config.yaml

# If you only customized site.yaml
cp config/site.yaml site/config.yaml
```

3. **Migrate your content:**
```bash
# If you have content-custom/
cp -r content-custom/* site/content/

# If you only modified content/
cp -r content/* site/content/
```

4. **Migrate your themes (if any):**
```bash
# If you have themes-custom/
cp -r themes-custom/* site/themes/
```

5. **Clean up (optional):**
```bash
# Remove old directories (they're gitignored now)
rm -rf content-custom themes-custom
```

### Configuration Changes

#### Old way:
```yaml
# config/site.yaml (template)
site:
  name: "Supersite"

# config/site.local.yaml (your overrides)
site:
  name: "My Custom Site"
```

#### New way:
```yaml
# site/config.yaml (all your settings in one file)
site:
  name: "My Custom Site"
```

The new system uses a single configuration file instead of template + overrides. This is simpler and more straightforward.

### Content Paths

Update any hardcoded paths in your custom code:

**Old paths:**
- `content/pages/` or `content-custom/pages/`
- `config/site.yaml` or `config/site.local.yaml`
- `themes/` or `themes-custom/`

**New paths:**
- `site/content/pages/`
- `site/config.yaml`
- `site/themes/` or `templates/themes/`

### Development Workflow

#### Before:
```bash
git clone ...
npm install
npm run setup           # Creates content-custom/ and site.local.yaml
# Edit content-custom/ and config/site.local.yaml
npm run dev
```

#### After:
```bash
git clone ...
npm install             # Auto-creates site/ directory
# Edit site/content/ and site/config.yaml
npm run dev
```

### Updating Framework

#### Before:
```bash
git pull                # Could conflict with modified files
# Manual merge sometimes needed
```

#### After:
```bash
git pull                # Never touches site/ directory
# Zero conflicts, instant updates
```

### Theme System

The theme system paths have changed but functionality remains the same:

**Built-in themes:**
- Old: `themes/default.yaml`
- New: `templates/themes/default.yaml`

**Custom themes:**
- Old: `themes-custom/my-theme.yaml` → `theme: "custom/my-theme"`
- New: `site/themes/my-theme.yaml` → `theme: "custom/my-theme"`

Usage in config remains identical:
```yaml
branding:
  theme: "modern"              # Built-in theme
  # or
  theme: "custom/my-theme"     # Your custom theme
```

### Git Ignore

The new `.gitignore` excludes `site/` entirely:

```gitignore
# User content workspace (local only)
site/

# Legacy (can be removed after migration)
content-custom/
themes-custom/
config/site.local.yaml
```

After migration, you can safely delete the legacy entries.

### Testing

After migration, verify everything works:

1. **Check site/ directory exists:**
```bash
ls -la site/
# Should show: content/, themes/, config.yaml
```

2. **Start dev server:**
```bash
npm run dev
```

3. **Verify your content loads:**
- Visit http://localhost:3000
- Check your custom pages appear
- Verify theme and branding applied

4. **Run tests:**
```bash
npm run test:ci
npm run test:e2e
```

5. **Test git status:**
```bash
git status
# site/ should NOT appear in changes
```

### Troubleshooting

**"Configuration file not found" error:**
- Ensure `site/config.yaml` exists
- Run `npm run setup:config` to create it

**Content not appearing:**
- Check `site/content/pages/` has your markdown files
- Run `npm run setup:content` to copy templates

**Theme not loading:**
- Verify theme name in `site/config.yaml`
- Check `site/themes/` or `templates/themes/` for theme file

**Old structure still showing up:**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

### Rollback

If you need to rollback temporarily:

```bash
# Restore old structure from backups
cp -r site-backup/content-custom ./content-custom
cp site-backup/site.local.yaml ./config/

# Checkout previous version
git checkout v0.1.0-alpha.1
npm install
```

### Need Help?

- Check [CONFIGURATION.md](./CONFIGURATION.md) for full config reference
- See [QUICKSTART.md](./QUICKSTART.md) for setup guide
- Open an issue: https://github.com/coachsteff/supersite/issues

### Breaking Changes

1. **Import paths** in custom TypeScript/JavaScript (if you extended the framework):
   - `@/lib/*` → `@/core/lib/*`
   - `@/components/*` → `@/core/components/*`

2. **Direct file system access** to content/config (if you wrote custom scripts):
   - Update paths to use `site/` instead of `content-custom/` or `config/`

3. **Environment variables**: No changes required

4. **API routes**: No changes required

5. **Test files**: Only if you added custom tests

### Future-Proofing

The new structure is designed for long-term stability:

- **Core framework** updates via `git pull`
- **Your content** stays in `site/` (never touched by git)
- **Templates** provide reference examples
- **No merge conflicts** during updates

This separation ensures smooth upgrades for all future releases.
