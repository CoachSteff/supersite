#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const configDir = path.join(__dirname, '..', 'config');
const templateConfig = path.join(configDir, 'site.yaml');
const userConfig = path.join(configDir, 'site.local.yaml');

// Check if site.local.yaml already exists
if (fs.existsSync(userConfig)) {
  console.log('✓ config/site.local.yaml already exists. Skipping setup.');
  console.log('  Your custom configuration is ready to use.');
  process.exit(0);
}

// Create minimal site.local.yaml with example overrides
const exampleConfig = `# User Configuration Overrides
# This file overrides settings in site.yaml
# Only specify the values you want to change

# Example: Customize your site name
# site:
#   name: "My Site Name"
#   description: "My site description"

# Example: Change brand colors
# branding:
#   primaryColor: "#FF6B35"
#   secondaryColor: "#004E89"

# Example: Configure custom content directory
# content:
#   customDirectory: "my-content"

# Uncomment and modify the examples above, or add your own overrides
`;

fs.writeFileSync(userConfig, exampleConfig, 'utf8');

console.log('✓ Created config/site.local.yaml');
console.log('');
console.log('Next steps:');
console.log('  1. Edit config/site.local.yaml to customize your site');
console.log('  2. Only add settings you want to override from site.yaml');
console.log('  3. Your config is gitignored and safe from updates');
console.log('');
console.log('See docs/CONFIGURATION.md for all available options.');
