import React from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownContent from '@/components/MarkdownContent';

jest.mock('@/lib/config', () => ({
  getSiteConfig: jest.fn(() => ({
    site: {
      url: 'http://localhost:3000',
    },
  })),
}));

jest.mock('@/components/PageActions', () => {
  return function MockPageActions() {
    return <div data-testid="page-actions">Page Actions</div>;
  };
});

describe('MarkdownContent', () => {
  it('should render HTML content', () => {
    const content = '<h1>Test Heading</h1><p>Test paragraph</p>';
    render(<MarkdownContent content={content} />);
    
    expect(screen.getByText(/test heading/i)).toBeInTheDocument();
    expect(screen.getByText(/test paragraph/i)).toBeInTheDocument();
  });

  it('should render PageActions when all props provided', () => {
    const props = {
      title: 'Test Page',
      content: '<p>Content</p>',
      markdown: '# Content',
      path: '/test',
    };
    
    render(<MarkdownContent {...props} />);
    
    expect(screen.getByTestId('page-actions')).toBeInTheDocument();
  });

  it('should not render PageActions when markdown missing', () => {
    const props = {
      title: 'Test Page',
      content: '<p>Content</p>',
      path: '/test',
    };
    
    render(<MarkdownContent {...props} />);
    
    expect(screen.queryByTestId('page-actions')).not.toBeInTheDocument();
  });

  it('should not render PageActions when path missing', () => {
    const props = {
      title: 'Test Page',
      content: '<p>Content</p>',
      markdown: '# Content',
    };
    
    render(<MarkdownContent {...props} />);
    
    expect(screen.queryByTestId('page-actions')).not.toBeInTheDocument();
  });

  it('should not render PageActions when title missing', () => {
    const props = {
      content: '<p>Content</p>',
      markdown: '# Content',
      path: '/test',
    };
    
    render(<MarkdownContent {...props} />);
    
    expect(screen.queryByTestId('page-actions')).not.toBeInTheDocument();
  });
});
