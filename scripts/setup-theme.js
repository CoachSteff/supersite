#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const siteThemes = path.join(__dirname, '..', 'site', 'themes');
const templateThemes = path.join(__dirname, '..', 'templates', 'themes');

if (!fs.existsSync(siteThemes)) {
  fs.mkdirSync(siteThemes, { recursive: true });
  console.log('✓ Created site/themes/ directory');
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║          Supersite Theme System Setup         ║');
console.log('╚════════════════════════════════════════════════╝\n');

if (fs.existsSync(templateThemes)) {
  const themes = fs.readdirSync(templateThemes)
    .filter(f => f.endsWith('.yaml'))
    .map(f => f.replace('.yaml', ''));
  
  console.log('📦 Available template themes:');
  themes.forEach(theme => {
    console.log(`   • ${theme}`);
  });
}

if (fs.existsSync(siteThemes)) {
  const customThemes = fs.readdirSync(siteThemes)
    .filter(f => f.endsWith('.yaml'));
  
  if (customThemes.length > 0) {
    console.log('\n🎨 Your custom themes:');
    customThemes.forEach(theme => {
      console.log(`   • custom/${theme.replace('.yaml', '')}`);
    });
  }
}

console.log('\n📖 How to use themes:');
console.log('\n  1. Choose a built-in theme:');
console.log('     Edit site/config.yaml:');
console.log('     ');
console.log('     branding:');
console.log('       theme: "modern"  # or default, minimal, dark, vibrant');
console.log('');
console.log('  2. Create a custom theme:');
console.log('     cp templates/themes/default.yaml site/themes/my-theme.yaml');
console.log('     # Edit my-theme.yaml with your colors');
console.log('     ');
console.log('     branding:');
console.log('       theme: "custom/my-theme"');
console.log('');
console.log('  3. Override specific values:');
console.log('     branding:');
console.log('       theme: "default"');
console.log('       overrides:');
console.log('         colors:');
console.log('           light:');
console.log('             primary: "#FF6B35"');
console.log('');
console.log('📚 See docs/THEMES.md for complete theme documentation.');
console.log('');
