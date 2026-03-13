import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const config = getSiteConfig();
  const siteUrl = config.site.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/settings/', '/user/'],
      },
      // Explicitly allow AI crawlers for GEO (Generative Engine Optimization)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
        disallow: ['/api/', '/admin/', '/settings/', '/user/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
