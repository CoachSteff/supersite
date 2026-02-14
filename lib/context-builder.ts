import { getAllPages, getAllBlogPosts, PageData, BlogPost } from './markdown';

export interface ContentItem {
  title: string;
  path: string;
  content: string;
  type: 'page' | 'blog';
  priority?: 'high' | 'medium' | 'low';
  summary?: string;
}

export async function getAllContent(): Promise<ContentItem[]> {
  const [pages, posts] = await Promise.all([
    getAllPages(),
    getAllBlogPosts(),
  ]);

  const content: ContentItem[] = [];

  for (const page of pages) {
    content.push({
      title: page.title,
      path: page.path,
      content: stripHtml(page.content),
      type: 'page',
      priority: page.chat?.priority || 'medium',
      summary: page.chat?.summary,
    });
  }

  for (const post of posts) {
    content.push({
      title: post.title,
      path: post.path,
      content: stripHtml(post.content),
      type: 'blog',
      priority: post.chat?.priority || 'medium',
      summary: post.chat?.summary,
    });
  }

  return content;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function prioritizeContent(
  content: ContentItem[],
  priority?: 'high' | 'medium' | 'low'
): ContentItem[] {
  if (!priority) {
    return content;
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const threshold = priorityOrder[priority];

  return content.filter(item => {
    const itemPriority = priorityOrder[item.priority || 'medium'];
    return itemPriority >= threshold;
  });
}

function scoreRelevance(item: ContentItem, queryTerms: string[]): number {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const contentLower = item.content.toLowerCase();
  const summaryLower = (item.summary || '').toLowerCase();

  for (const term of queryTerms) {
    if (titleLower.includes(term)) score += 10;
    if (summaryLower.includes(term)) score += 5;
    if (contentLower.includes(term)) score += 1;
  }

  // Boost by priority
  const priorityBoost = { high: 3, medium: 1, low: 0 };
  score += priorityBoost[item.priority || 'medium'];

  return score;
}

export async function buildContext(query: string): Promise<string> {
  const allContent = await getAllContent();

  // Always include high-priority content
  const highPriority = allContent.filter(item => item.priority === 'high');

  // Score and rank remaining content by relevance to query
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const scored = allContent
    .filter(item => item.priority !== 'high')
    .map(item => ({ item, score: scoreRelevance(item, queryTerms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ item }) => item);

  const contentToUse = [...highPriority, ...scored];

  // Fallback: if nothing matched, use all content (small site)
  if (contentToUse.length === 0) {
    return formatContextForAI(allContent);
  }

  return formatContextForAI(contentToUse);
}

export function formatContextForAI(content: ContentItem[]): string {
  let context = 'Here is the content from the website:\n\n';

  for (const item of content) {
    context += `--- ${item.type.toUpperCase()}: ${item.title} (${item.path}) ---\n`;
    
    if (item.summary) {
      context += `Summary: ${item.summary}\n`;
    }
    
    const truncatedContent = item.content.substring(0, 1000);
    context += `${truncatedContent}${item.content.length > 1000 ? '...' : ''}\n\n`;
  }

  return context;
}

export function truncateContext(context: string, maxLength: number = 8000): string {
  if (context.length <= maxLength) {
    return context;
  }
  
  return context.substring(0, maxLength) + '\n\n... (content truncated)';
}
