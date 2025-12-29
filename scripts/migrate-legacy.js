#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const siteDir = path.join(rootDir, 'site');

console.log('🔄 Supersite Migration Tool');
console.log('===========================\n');

// Check if migration is needed
const hasOldConfig = fs.existsSync(path.join(rootDir, 'config', 'site.local.yaml'));
const hasOldContent = fs.existsSync(path.join(rootDir, 'content-custom'));
const hasOldThemes = fs.existsSync(path.join(rootDir, 'themes-custom'));
const hasSite = fs.existsSync(siteDir);

if (!hasOldConfig && !hasOldContent && !hasOldThemes) {
  console.log('✓ No legacy structure detected. Nothing to migrate.');
  if (!hasSite) {
    console.log('\nRun "npm run setup" to initialize your site.');
  }
  process.exit(0);
}

console.log('📦 Detected legacy structure:');
if (hasOldConfig) console.log('  • config/site.local.yaml');
if (hasOldContent) console.log('  • content-custom/');
if (hasOldThemes) console.log('  • themes-custom/');
console.log('');

// Create site directory if needed
if (!fs.existsSync(siteDir)) {
  fs.mkdirSync(siteDir, { recursive: true });
  console.log('✓ Created site/ directory');
}

// Migrate configuration
const oldConfigPath = path.join(rootDir, 'config', 'site.local.yaml');
const newConfigPath = path.join(siteDir, 'config.yaml');

if (hasOldConfig && !fs.existsSync(newConfigPath)) {
  fs.copyFileSync(oldConfigPath, newConfigPath);
  console.log('✓ Migrated config/site.local.yaml → site/config.yaml');
} else if (!fs.existsSync(newConfigPath)) {
  const templateConfig = path.join(rootDir, 'templates', 'config.yaml');
  fs.copyFileSync(templateConfig, newConfigPath);
  console.log('✓ Created site/config.yaml from template');
}

// Migrate content
const oldContentDir = path.join(rootDir, 'content-custom');
const newContentDir = path.join(siteDir, 'content');

if (hasOldContent && !fs.existsSync(newContentDir)) {
  fs.cpSync(oldContentDir, newContentDir, { recursive: true });
  console.log('✓ Migrated content-custom/ → site/content/');
} else if (!fs.existsSync(newContentDir)) {
  const templateContent = path.join(rootDir, 'templates', 'content');
  fs.cpSync(templateContent, newContentDir, { recursive: true });
  console.log('✓ Created site/content/ from templates');
}

// Migrate themes
const oldThemesDir = path.join(rootDir, 'themes-custom');
const newThemesDir = path.join(siteDir, 'themes');

if (hasOldThemes && !fs.existsSync(newThemesDir)) {
  fs.cpSync(oldThemesDir, newThemesDir, { recursive: true });
  console.log('✓ Migrated themes-custom/ → site/themes/');
} else if (!fs.existsSync(newThemesDir)) {
  fs.mkdirSync(newThemesDir, { recursive: true });
  console.log('✓ Created site/themes/ directory');
}

console.log('\n✅ Migration complete!');
console.log('\n📁 New structure:');
console.log('  site/');
console.log('  ├── content/     # Your markdown files');
console.log('  ├── themes/      # Your custom themes');
console.log('  └── config.yaml  # Your configuration');
console.log('\n🗑️  Old directories (can be safely deleted):');
if (hasOldConfig) console.log('  • config/site.local.yaml');
if (hasOldContent) console.log('  • content-custom/');
if (hasOldThemes) console.log('  • themes-custom/');
console.log('\n⚠️  These are now gitignored and won\'t be tracked.');
console.log('\n🚀 Next steps:');
console.log('  1. Review site/ directory contents');
console.log('  2. Run "npm run dev" to test');
console.log('  3. Delete old directories when ready');
console.log('\nSee docs/MIGRATION.md for details.');
