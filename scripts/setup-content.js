#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const templateContent = path.join(__dirname, '..', 'templates', 'content');
const siteContent = path.join(__dirname, '..', 'site', 'content');

if (fs.existsSync(siteContent)) {
  console.log('✓ site/content/ already exists. Skipping setup.');
  console.log('  Your content is ready to use.');
  process.exit(0);
}

console.log('Setting up your content...');
fs.cpSync(templateContent, siteContent, { recursive: true });

console.log('✓ Created site/content/ from templates');
console.log('');
console.log('Next steps:');
console.log('  1. Edit files in site/content/ to customize your site');
console.log('  2. Template content in templates/content/ is for reference');
console.log('  3. Run "git pull" anytime to get framework updates');
console.log('');
console.log('Your site/ folder is gitignored and safe from conflicts.');
