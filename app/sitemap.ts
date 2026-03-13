import type { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSiteConfig } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getSiteConfig();
  const siteUrl = config.site.url;
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  });

  // Content pages
  const contentDir = config.content?.customDirectory || 'content-custom';
  const pagesDir = path.join(process.cwd(), contentDir, 'pages');

  if (fs.existsSync(pagesDir)) {
    const pageFiles = getAllMarkdownFiles(pagesDir);
    for (const file of pageFiles) {
      const relativePath = path.relative(pagesDir, file);
      const slug = relativePath
        .replace(/\.md$/, '')
        .replace(/\/index$/, '')
        .replace(/\\/g, '/');

      if (!slug || slug === 'home') continue;

      // Check for noindex in frontmatter
      const contents = fs.readFileSync(file, 'utf8');
      const { data } = matter(contents);
      if (data.seo?.noindex) continue;

      const stat = fs.statSync(file);

      entries.push({
        url: `${siteUrl}/${slug}`,
        lastModified: data.lastModified ? new Date(data.lastModified) : stat.mtime,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Blog posts
  const blogDir = path.join(process.cwd(), contentDir, 'blog');

  if (fs.existsSync(blogDir)) {
    const blogFiles = getAllMarkdownFiles(blogDir);
    for (const file of blogFiles) {
      const fileName = path.basename(file, '.md');
      const contents = fs.readFileSync(file, 'utf8');
      const { data } = matter(contents);

      if (data.seo?.noindex) continue;

      const stat = fs.statSync(file);

      entries.push({
        url: `${siteUrl}/blog/${fileName}`,
        lastModified: data.lastModified ? new Date(data.lastModified) : stat.mtime,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Static routes from navigation
  const navLinks = config.navigation?.customLinks || [];
  const existingSlugs = new Set(entries.map(e => e.url));

  for (const link of navLinks) {
    const fullUrl = `${siteUrl}${link.path}`;
    if (!existingSlugs.has(fullUrl) && !link.path.startsWith('http')) {
      entries.push({
        url: fullUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}
