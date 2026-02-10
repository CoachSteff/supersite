import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getSiteConfig } from './config';
import { getProvider } from './ai-providers';
import type { PageData, BlogPost } from './markdown';

interface CachedTranslation {
  markdown: string;
  title: string;
  description?: string;
  timestamp: number;
  sourceHash: string;
  language: string;
}

/**
 * Generate SHA-256 hash of content for cache key
 */
export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Get cached translation if it exists and is valid
 */
export function getCachedTranslation(contentHash: string, lang: string): CachedTranslation | null {
  const config = getSiteConfig();
  
  if (!config.multilingual?.caching?.enabled) {
    return null;
  }
  
  const cacheDir = config.multilingual.caching.directory || '.cache/translations';
  const cachePath = path.join(process.cwd(), cacheDir, contentHash, `${lang}.json`);
  
  if (!fs.existsSync(cachePath)) {
    return null;
  }
  
  try {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CachedTranslation;
    
    // Validate cache integrity
    if (cached.sourceHash !== contentHash || cached.language !== lang) {
      return null;
    }
    
    return cached;
  } catch (error) {
    console.error('Error reading translation cache:', error);
    return null;
  }
}

/**
 * Save translation to cache
 */
export function setCachedTranslation(
  contentHash: string,
  lang: string,
  translation: { markdown: string; title: string; description?: string }
): void {
  const config = getSiteConfig();
  
  if (!config.multilingual?.caching?.enabled) {
    return;
  }
  
  const cacheDir = config.multilingual.caching.directory || '.cache/translations';
  const hashDir = path.join(process.cwd(), cacheDir, contentHash);
  const cachePath = path.join(hashDir, `${lang}.json`);
  
  try {
    // Ensure directory exists
    fs.mkdirSync(hashDir, { recursive: true });
    
    const cached: CachedTranslation = {
      ...translation,
      timestamp: Date.now(),
      sourceHash: contentHash,
      language: lang,
    };
    
    fs.writeFileSync(cachePath, JSON.stringify(cached, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing translation cache:', error);
  }
}

/**
 * Translate markdown content using AI provider
 */
export async function translateContent(
  content: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const config = getSiteConfig();
  
  if (!config.multilingual?.useAiTranslation) {
    throw new Error('AI translation is disabled in configuration');
  }
  
  // Map language codes to full names
  const languageNames: Record<string, string> = {
    en: 'English',
    nl: 'Dutch',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
  };
  
  const sourceLangName = languageNames[sourceLang] || sourceLang;
  const targetLangName = languageNames[targetLang] || targetLang;
  
  const translationPrompt = `Translate the following markdown content from ${sourceLangName} to ${targetLangName}.

Requirements:
- Preserve all markdown formatting (headers, lists, links, code blocks, bold, italic)
- Keep URLs and file paths unchanged
- Maintain frontmatter structure (YAML between --- markers)
- Translate frontmatter fields like title, description, author
- Keep technical terms and proper nouns appropriate for the context
- Use natural, fluent ${targetLangName}
- Preserve line breaks and paragraph structure
- Do not add any comments or explanations, only return the translated content

Content to translate:
${content}`;
  
  try {
    const provider = getProvider(config);
    const response = await provider.chat(
      [{ role: 'user', content: translationPrompt }],
      'You are a professional translator specializing in markdown content. Translate accurately while preserving all formatting.',
      ''
    );
    
    if (response.error) {
      throw new Error(`Translation failed: ${response.error}`);
    }
    
    return response.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Convert markdown to HTML
 */
async function markdownToHtml(markdown: string): Promise<string> {
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(markdown);
  
  return processedContent.toString();
}

/**
 * Translate a PageData object to target language
 */
export async function translatePageContent(
  page: PageData,
  targetLang: string
): Promise<PageData> {
  const config = getSiteConfig();
  
  // Check if translation is enabled
  if (!config.multilingual?.enabled) {
    return page;
  }
  
  // Check if target language is supported
  const supportedLanguages = config.multilingual.supportedLanguages || ['en'];
  if (!supportedLanguages.includes(targetLang)) {
    console.warn(`Language ${targetLang} not supported, returning original content`);
    return page;
  }
  
  // If already in target language, return as-is
  if (targetLang === 'en') {
    return page;
  }
  
  const contentHash = generateContentHash(page.markdown);
  const cached = getCachedTranslation(contentHash, targetLang);
  
  if (cached) {
    // Reconstruct PageData from cache
    const translatedContent = await markdownToHtml(cached.markdown);
    
    return {
      ...page,
      title: cached.title,
      description: cached.description,
      content: translatedContent,
      markdown: cached.markdown,
    };
  }
  
  // Translate markdown content
  const translatedMarkdown = await translateContent(page.markdown, 'en', targetLang);
  
  // Re-parse translated markdown to HTML
  const translatedContent = await markdownToHtml(translatedMarkdown);
  
  // Extract translated metadata from frontmatter
  const { data } = matter(translatedMarkdown);
  const translatedTitle = (data.title as string) || page.title;
  const translatedDescription = (data.description as string) || page.description;
  
  const result = {
    ...page,
    title: translatedTitle,
    description: translatedDescription,
    content: translatedContent,
    markdown: translatedMarkdown,
  };
  
  // Cache for future use
  setCachedTranslation(contentHash, targetLang, {
    markdown: translatedMarkdown,
    title: translatedTitle,
    description: translatedDescription,
  });
  
  return result;
}

/**
 * Translate a BlogPost object to target language
 */
export async function translateBlogPost(
  post: BlogPost,
  targetLang: string
): Promise<BlogPost> {
  const config = getSiteConfig();
  
  // Check if translation is enabled
  if (!config.multilingual?.enabled) {
    return post;
  }
  
  // Check if target language is supported
  const supportedLanguages = config.multilingual.supportedLanguages || ['en'];
  if (!supportedLanguages.includes(targetLang)) {
    console.warn(`Language ${targetLang} not supported, returning original content`);
    return post;
  }
  
  // If already in target language, return as-is
  if (targetLang === 'en') {
    return post;
  }
  
  const contentHash = generateContentHash(post.markdown);
  const cached = getCachedTranslation(contentHash, targetLang);
  
  if (cached) {
    // Reconstruct BlogPost from cache
    const translatedContent = await markdownToHtml(cached.markdown);
    
    return {
      ...post,
      title: cached.title,
      description: cached.description,
      content: translatedContent,
      markdown: cached.markdown,
    };
  }
  
  // Translate markdown content
  const translatedMarkdown = await translateContent(post.markdown, 'en', targetLang);
  
  // Re-parse translated markdown to HTML
  const translatedContent = await markdownToHtml(translatedMarkdown);
  
  // Extract translated metadata from frontmatter
  const { data } = matter(translatedMarkdown);
  const translatedTitle = (data.title as string) || post.title;
  const translatedDescription = (data.description as string) || post.description;
  
  const result = {
    ...post,
    title: translatedTitle,
    description: translatedDescription,
    content: translatedContent,
    markdown: translatedMarkdown,
  };
  
  // Cache for future use
  setCachedTranslation(contentHash, targetLang, {
    markdown: translatedMarkdown,
    title: translatedTitle,
    description: translatedDescription,
  });
  
  return result;
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    nl: 'Nederlands',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
  };
  
  return languageNames[code] || code.toUpperCase();
}
