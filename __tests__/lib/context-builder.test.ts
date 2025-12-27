import { truncateContext, stripHtml } from '@/lib/context-builder';

describe('Context Builder', () => {
  describe('truncateContext', () => {
    it('should not truncate short context', () => {
      const shortContext = 'This is a short context';
      expect(truncateContext(shortContext)).toBe(shortContext);
    });

    it('should truncate long context', () => {
      const longContext = 'a'.repeat(10000);
      const truncated = truncateContext(longContext);
      expect(truncated.length).toBeLessThan(longContext.length);
      expect(truncated).toContain('...');
    });

    it('should preserve structure when truncating', () => {
      const context = 'Important content\n' + 'x'.repeat(10000);
      const truncated = truncateContext(context);
      expect(truncated).toContain('Important content');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      expect(stripHtml(html)).toBe('Hello world');
    });

    it('should handle nested tags', () => {
      const html = '<div><p>Test <span>content</span></p></div>';
      expect(stripHtml(html)).toBe('Test content');
    });

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });

    it('should handle plain text', () => {
      const text = 'Plain text content';
      expect(stripHtml(text)).toBe(text);
    });
  });
});
