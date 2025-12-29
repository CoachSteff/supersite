#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const scriptsDir = __dirname;

console.log('🚀 Initializing site/ workspace...\n');

try {
  execSync('node ' + path.join(scriptsDir, 'setup-config.js'), { stdio: 'inherit' });
  execSync('node ' + path.join(scriptsDir, 'setup-content.js'), { stdio: 'inherit' });
  execSync('node ' + path.join(scriptsDir, 'setup-theme.js'), { stdio: 'inherit' });
  
  console.log('\n✅ Site initialization complete!');
  console.log('\nYour site/ directory structure:');
  console.log('  site/');
  console.log('  ├── content/     # Your markdown content');
  console.log('  ├── themes/      # Your custom themes');
  console.log('  └── config.yaml  # Your site configuration');
  console.log('\nThis directory is git-ignored and safe from updates.');
  console.log('Run "npm run dev" to start developing!');
} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}
