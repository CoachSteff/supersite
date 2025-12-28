#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const contentDir = path.join(__dirname, '..', 'content');
const configFile = path.join(__dirname, '..', 'config', 'site.local.yaml');

// Determine custom content directory from config or use default
let customDir = path.join(__dirname, '..', 'content-custom');

if (fs.existsSync(configFile)) {
  try {
    const config = yaml.load(fs.readFileSync(configFile, 'utf8'));
    if (config && config.content && config.content.customDirectory) {
      customDir = path.join(__dirname, '..', config.content.customDirectory);
    }
  } catch (error) {
    console.warn('Warning: Could not read config, using default content-custom/');
  }
}

// Check if custom content already exists
if (fs.existsSync(customDir)) {
  console.log(`✓ ${path.basename(customDir)}/ already exists. Skipping setup.`);
  console.log('  Your custom content is ready to use.');
  process.exit(0);
}

// Copy template content to custom directory
console.log('Setting up your custom content...');
fs.cpSync(contentDir, customDir, { recursive: true });

console.log('✓ Setup complete!');
console.log('');
console.log('Next steps:');
console.log(`  1. Edit files in ${path.basename(customDir)}/ to customize your site`);
console.log('  2. Template content in content/ will be used as fallback');
console.log('  3. Run "git pull" anytime to get template updates');
console.log('');
console.log(`Your ${path.basename(customDir)}/ folder is gitignored and safe from conflicts.`);
