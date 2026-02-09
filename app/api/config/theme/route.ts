import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';

// Simple write lock to prevent concurrent writes
let writeLock = false;
const lockQueue: Array<() => void> = [];

async function acquireLock(): Promise<void> {
  if (!writeLock) {
    writeLock = true;
    return;
  }
  
  // Wait for lock to be released
  return new Promise((resolve) => {
    lockQueue.push(resolve);
  });
}

function releaseLock(): void {
  const next = lockQueue.shift();
  if (next) {
    next();
  } else {
    writeLock = false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json(
        { error: 'Theme name is required' },
        { status: 400 }
      );
    }

    // Validate theme exists
    const validThemes = ['base', 'blog', 'business', 'chatbot', 'community', 'influencer'];
    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme name' },
        { status: 400 }
      );
    }

    // Acquire write lock
    await acquireLock();

    try {
      const configPath = join(process.cwd(), 'config', 'site.yaml');
      const configContent = await readFile(configPath, 'utf-8');
      const config = yaml.load(configContent) as any;

      config.branding = config.branding || {};
      config.branding.theme = theme;

      const updatedContent = yaml.dump(config, {
        lineWidth: -1, // Don't wrap lines
        noRefs: true,
      });
      
      await writeFile(configPath, updatedContent, 'utf-8');

      return NextResponse.json({ 
        success: true, 
        theme,
        message: `Theme switched to ${theme}` 
      });
    } finally {
      releaseLock();
    }
  } catch (error) {
    console.error('[Theme Switch] Error:', error);
    return NextResponse.json(
      { error: 'Failed to switch theme' },
      { status: 500 }
    );
  }
}
