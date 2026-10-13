#!/usr/bin/env node
/**
 * Sync theme-owned asset folders into Next.js's `public/` so they're served
 * as static files. Runs before `dev` and `build`.
 *
 * Sources:
 *   themes/<name>/assets/*           → public/themes/<name>/assets/*
 *   themes-custom/<name>/assets/*    → public/themes/<name>/assets/*
 *
 * `themes-custom/` is gitignored — that's where site-specific themes live.
 * Idempotent — overwrites existing destination files. Skips themes without
 * an `assets/` folder.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIRS = [
  path.join(ROOT, 'themes'),
  path.join(ROOT, 'themes-custom'),
];
const PUBLIC_THEMES_DIR = path.join(ROOT, 'public', 'themes');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function syncDir(themesRoot) {
  if (!fs.existsSync(themesRoot)) return 0;

  let synced = 0;
  for (const theme of fs.readdirSync(themesRoot)) {
    const themePath = path.join(themesRoot, theme);
    if (!fs.statSync(themePath).isDirectory()) continue;

    const assetsSrc = path.join(themePath, 'assets');
    if (!fs.existsSync(assetsSrc)) continue;

    const assetsDest = path.join(PUBLIC_THEMES_DIR, theme, 'assets');
    fs.mkdirSync(assetsDest, { recursive: true });
    copyRecursive(assetsSrc, assetsDest);
    synced += 1;
  }
  return synced;
}

const total = SOURCE_DIRS.reduce((sum, dir) => sum + syncDir(dir), 0);
if (total > 0) {
  console.log(`[sync-theme-assets] Synced assets for ${total} theme${total === 1 ? '' : 's'}.`);
}
