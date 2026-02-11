import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { getSiteConfig } from './config';

// Get content directory with configuration support
function getContentDirectory(): string {
  const config = getSiteConfig();
  const cwd = process.cwd();
  
  // Priority 1: User-configured custom directory
  if (config.content?.customDirectory) {
    const customPath = path.join(cwd, config.content.customDirectory);
    if (fs.existsSync(customPath)) {
      return customPath;
    }
    console.warn(`Configured content directory not found: ${customPath}, falling back...`);
  }
  
  // Priority 2: Default custom directory (content-custom/)
  const defaultCustomDir = path.join(cwd, 'content-custom');
  if (fs.existsSync(defaultCustomDir)) {
    return defaultCustomDir;
  }
  
  // Priority 3: Template directory (content/)
  const templateDir = config.content?.templateDirectory 
    ? path.join(cwd, config.content.templateDirectory)
    : path.join(cwd, 'content');
  
  return templateDir;
}

const contentDirectory = getContentDirectory();

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  noindex?: boolean;
}

export interface ChatMetadata {
  priority?: 'high' | 'medium' | 'low';
  summary?: string;
}

export interface PageData {
  slug: string;
  title: string;
  description?: string;
  content: string;
  markdown: string;
  path: string;
  author?: string;
  publishedDate?: string;
  lastModified?: string;
  seo?: SEOMetadata;
  chat?: ChatMetadata;
  custom?: Record<string, any>;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author?: string;
  description?: string;
  tags?: string[];
  content: string;
  markdown: string;
  path: string;
  seo?: SEOMetadata;
  chat?: ChatMetadata;
  custom?: Record<string, any>;
}

export interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

export function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function parseMarkdown(filePath: string): Promise<{ data: Record<string, unknown>; content: string; htmlContent: string }> {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);
  
  const htmlContent = processedContent.toString();

  return { data, content, htmlContent };
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(markdown);
  
  return result.toString();
}

export async function getPageBySlug(slug: string[]): Promise<PageData | null> {
  const pagesDir = path.join(contentDirectory, 'pages');
  
  const slugPath = slug.join('/');
  let filePath = path.join(pagesDir, slugPath + '.md');
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(pagesDir, slugPath, 'index.md');
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { data, content, htmlContent } = await parseMarkdown(filePath);

  return {
    slug: slugPath,
    title: (data.title as string) || 'Untitled',
    description: data.description as string | undefined,
    content: htmlContent,
    markdown: content,
    path: '/' + slugPath,
    author: data.author as string | undefined,
    publishedDate: data.publishedDate as string | undefined,
    lastModified: data.lastModified as string | undefined,
    seo: data.seo as SEOMetadata | undefined,
    chat: data.chat as ChatMetadata | undefined,
    custom: data.custom as Record<string, unknown> | undefined,
  };
}

export async function getAllPages(): Promise<PageData[]> {
  const pagesDir = path.join(contentDirectory, 'pages');
  
  if (!fs.existsSync(pagesDir)) {
    return [];
  }

  const files = getAllMarkdownFiles(pagesDir);
  const pages: PageData[] = [];

  for (const file of files) {
    const relativePath = path.relative(pagesDir, file);
    let slug = relativePath.replace(/\.md$/, '').replace(/\/index$/, '').replace(/\\/g, '/');
    
    if (!slug) {
      slug = 'home';
    }

    const { data, content, htmlContent } = await parseMarkdown(file);

    pages.push({
      slug,
      title: (data.title as string) || 'Untitled',
      description: data.description as string | undefined,
      content: htmlContent,
      markdown: content,
      path: slug === 'home' ? '/' : '/' + slug,
      author: data.author as string | undefined,
      publishedDate: data.publishedDate as string | undefined,
      lastModified: data.lastModified as string | undefined,
      seo: data.seo as SEOMetadata | undefined,
      chat: data.chat as ChatMetadata | undefined,
      custom: data.custom as Record<string, unknown> | undefined,
    });
  }

  return pages;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(contentDirectory, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = getAllMarkdownFiles(blogDir);
  const posts: BlogPost[] = [];

  for (const file of files) {
    const fileName = path.basename(file, '.md');
    const { data, content, htmlContent } = await parseMarkdown(file);

    posts.push({
      slug: fileName,
      title: (data.title as string) || 'Untitled',
      date: (data.date as string) || '',
      author: data.author as string | undefined,
      description: data.description as string | undefined,
      tags: (data.tags as string[]) || [],
      content: htmlContent,
      markdown: content,
      path: `/blog/${fileName}`,
      seo: data.seo as SEOMetadata | undefined,
      chat: data.chat as ChatMetadata | undefined,
      custom: data.custom as Record<string, unknown> | undefined,
    });
  }

  posts.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  return posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const blogDir = path.join(contentDirectory, 'blog');
  const filePath = path.join(blogDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { data, content, htmlContent } = await parseMarkdown(filePath);

  return {
    slug,
    title: (data.title as string) || 'Untitled',
    date: (data.date as string) || '',
    author: data.author as string | undefined,
    description: data.description as string | undefined,
    tags: (data.tags as string[]) || [],
    content: htmlContent,
    markdown: content,
    path: `/blog/${slug}`,
    seo: data.seo as SEOMetadata | undefined,
    chat: data.chat as ChatMetadata | undefined,
    custom: data.custom as Record<string, unknown> | undefined,
  };
}

export function getFolderStructure(): NavItem[] {
  const pagesDir = path.join(contentDirectory, 'pages');
  
  if (!fs.existsSync(pagesDir)) {
    return [];
  }

  function buildTree(dir: string, basePath: string = ''): NavItem[] {
    const items: NavItem[] = [];
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const indexPath = path.join(fullPath, 'index.md');
        const urlPath = basePath + '/' + entry;
        
        const navItem: NavItem = {
          title: entry.charAt(0).toUpperCase() + entry.slice(1).replace(/-/g, ' '),
          path: urlPath,
        };

        const children = buildTree(fullPath, urlPath);
        if (children.length > 0) {
          navItem.children = children;
        }

        items.push(navItem);
      } else if (entry.endsWith('.md') && entry !== 'index.md') {
        const slug = entry.replace(/\.md$/, '');
        const urlPath = basePath + '/' + slug;
        
        items.push({
          title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          path: urlPath,
        });
      }
    }

    return items;
  }

  return buildTree(pagesDir);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllBlogPosts();
  const tagMap = new Map<string, number>();
  
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });
  
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAllCategories(): Promise<{ category: string; count: number }[]> {
  const posts = await getAllBlogPosts();
  const categoryMap = new Map<string, number>();
  
  posts.forEach(post => {
    const category = post.custom?.category as string || 'Uncategorized';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getRecentBlogPosts(limit: number = 5): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.slice(0, limit);
}
