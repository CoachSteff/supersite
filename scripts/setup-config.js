#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, '..', 'site');
const templateConfig = path.join(__dirname, '..', 'templates', 'config.yaml');
const siteConfig = path.join(siteDir, 'config.yaml');

if (fs.existsSync(siteConfig)) {
  console.log('✓ site/config.yaml already exists. Skipping setup.');
  console.log('  Your configuration is ready to use.');
  process.exit(0);
}

if (!fs.existsSync(siteDir)) {
  fs.mkdirSync(siteDir, { recursive: true });
}

fs.copyFileSync(templateConfig, siteConfig);

console.log('✓ Created site/config.yaml from template');
console.log('');
console.log('Next steps:');
console.log('  1. Edit site/config.yaml to customize your site');
console.log('  2. Your site/ directory is gitignored and safe from updates');
console.log('');
console.log('See docs/CONFIGURATION.md for all available options.');
