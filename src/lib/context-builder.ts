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

export async function buildContext(query: string): Promise<string> {
  const allContent = await getAllContent();
  
  const highPriorityContent = prioritizeContent(allContent, 'high');
  const contentToUse = highPriorityContent.length > 0 ? highPriorityContent : allContent;

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
