import { getSiteConfig } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function GET() {
  const config = getSiteConfig();
  const siteUrl = config.site.url;

  const lines: string[] = [];

  // Title
  lines.push(`# ${config.site.name}`);
  lines.push('');

  // Summary blockquote
  const summary = config.seo.defaultDescription;
  lines.push(`> ${summary}`);
  lines.push('');

  // Core pages from navigation
  const navLinks = config.navigation?.customLinks || [];
  if (navLinks.length > 0) {
    lines.push('## Core Pages');
    lines.push('');
    for (const link of navLinks) {
      if (!link.path.startsWith('http')) {
        lines.push(`- [${link.title}](${siteUrl}${link.path})`);
      }
    }
    lines.push('');
  }

  // Blog section if enabled
  if (config.features?.blog) {
    lines.push('## Blog');
    lines.push('');
    lines.push(`- [Blog](${siteUrl}/blog)`);
    lines.push('');
  }

  // Contact info
  if (config.social) {
    const socialEntries = Object.entries(config.social).filter(([, url]) => url);
    if (socialEntries.length > 0) {
      lines.push('## Social');
      lines.push('');
      for (const [platform, url] of socialEntries) {
        lines.push(`- [${platform.charAt(0).toUpperCase() + platform.slice(1)}](${url})`);
      }
      lines.push('');
    }
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
