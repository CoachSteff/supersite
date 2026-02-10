import { NextResponse } from 'next/server';
import { getFolderStructure } from '@/lib/markdown';
import { getSiteConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = getSiteConfig();
    let items = [];
    
    if (config.navigation?.autoGenerate) {
      items = getFolderStructure();
    }
    
    if (config.navigation?.customLinks) {
      // Merge custom links, avoiding duplicates
      const existingPaths = new Set(items.map(item => item.path));
      const newLinks = config.navigation.customLinks.filter(
        link => !existingPaths.has(link.path)
      );
      items = [...items, ...newLinks];
    }
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Navigation error:', error);
    return NextResponse.json({ items: [] });
  }
}
