/**
 * Tests for lib/context-builder.ts
 * Covers content retrieval, relevance scoring, and context building
 */

jest.mock('@/lib/markdown', () => ({
  getAllPages: jest.fn().mockResolvedValue([
    {
      title: 'About Us',
      path: '/about',
      content: '<p>We are a software company.</p>',
      markdown: 'We are a software company.',
      slug: 'about',
      chat: { priority: 'high', summary: 'Company information' },
    },
    {
      title: 'Services',
      path: '/services',
      content: '<p>We offer consulting and development services.</p>',
      markdown: 'We offer consulting and development services.',
      slug: 'services',
      chat: { priority: 'medium' },
    },
    {
      title: 'Contact',
      path: '/contact',
      content: '<p>Email us at hello@example.com</p>',
      markdown: 'Email us at hello@example.com',
      slug: 'contact',
      chat: { priority: 'low' },
    },
  ]),
  getAllBlogPosts: jest.fn().mockResolvedValue([
    {
      title: 'Introduction to AI',
      path: '/blog/intro-to-ai',
      content: '<p>Artificial intelligence is transforming the world.</p>',
      markdown: 'Artificial intelligence is transforming the world.',
      slug: 'intro-to-ai',
      date: '2024-01-01',
      tags: ['ai'],
      chat: { priority: 'medium', summary: 'AI overview' },
    },
  ]),
}));

import {
  getAllContent,
  stripHtml,
  prioritizeContent,
  buildContext,
  formatContextForAI,
  truncateContext,
} from '@/lib/context-builder';

describe('Context Builder', () => {
  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });

    it('decodes HTML entities', () => {
      expect(stripHtml('&amp; &lt; &gt; &quot; &#39;')).toBe("& < > \" '");
    });

    it('collapses whitespace', () => {
      expect(stripHtml('  hello   world  ')).toBe('hello world');
    });
  });

  describe('getAllContent', () => {
    it('returns combined pages and posts', async () => {
      const content = await getAllContent();
      expect(content).toHaveLength(4);
      expect(content[0].type).toBe('page');
      expect(content[3].type).toBe('blog');
    });

    it('strips HTML from content', async () => {
      const content = await getAllContent();
      expect(content[0].content).not.toContain('<p>');
    });
  });

  describe('prioritizeContent', () => {
    it('filters by priority threshold', async () => {
      const content = await getAllContent();
      const high = prioritizeContent(content, 'high');
      expect(high.length).toBe(1);
      expect(high[0].title).toBe('About Us');
    });

    it('returns all content when no priority specified', async () => {
      const content = await getAllContent();
      const all = prioritizeContent(content);
      expect(all.length).toBe(4);
    });
  });

  describe('buildContext', () => {
    it('includes high-priority content regardless of query', async () => {
      const context = await buildContext('random query');
      expect(context).toContain('About Us');
    });

    it('includes content relevant to the query', async () => {
      const context = await buildContext('consulting services');
      expect(context).toContain('Services');
    });

    it('falls back to all content when nothing matches', async () => {
      const context = await buildContext('xyz');
      // Should include all content as fallback
      expect(context).toContain('About Us');
    });
  });

  describe('truncateContext', () => {
    it('truncates content exceeding maxLength', () => {
      const long = 'a'.repeat(10000);
      const truncated = truncateContext(long, 100);
      expect(truncated.length).toBeLessThan(200);
      expect(truncated).toContain('truncated');
    });

    it('leaves short content unchanged', () => {
      const short = 'Hello world';
      expect(truncateContext(short, 100)).toBe(short);
    });
  });

  describe('formatContextForAI', () => {
    it('formats content items into a readable string', async () => {
      const content = await getAllContent();
      const formatted = formatContextForAI(content.slice(0, 1));
      expect(formatted).toContain('PAGE: About Us');
      expect(formatted).toContain('/about');
      expect(formatted).toContain('Company information');
    });
  });
});
