import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageActions from '@/components/PageActions';

jest.mock('@/lib/favorites', () => ({
  isFavorite: jest.fn(() => false),
  toggleFavorite: jest.fn(() => true),
}));

describe('PageActions', () => {
  const defaultProps = {
    title: 'Test Page',
    markdown: '# Test Content\n\nThis is test content.',
    path: '/test',
    url: 'http://localhost:3000/test',
  };

  it('should render all action buttons', () => {
    render(<PageActions {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('should copy markdown to clipboard', async () => {
    const user = userEvent.setup();
    render(<PageActions {...defaultProps} />);
    
    const copyButton = screen.getByLabelText(/copy as markdown/i);
    await user.click(copyButton);
    
    // Verify copy feedback appears (indicates clipboard was called successfully)
    await screen.findByText(/copied!/i);
  });

  it('should show copied feedback after copy', async () => {
    const user = userEvent.setup();
    render(<PageActions {...defaultProps} />);
    
    const copyButton = screen.getByLabelText(/copy as markdown/i);
    await user.click(copyButton);
    
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });

  it('should toggle favorite state', async () => {
    const user = userEvent.setup();
    const { toggleFavorite } = require('@/lib/favorites');
    
    render(<PageActions {...defaultProps} />);
    
    const starButton = screen.getByLabelText(/add to favorites/i);
    await user.click(starButton);
    
    expect(toggleFavorite).toHaveBeenCalledWith(defaultProps.path);
  });

  it('should open share popup when share button clicked', async () => {
    const user = userEvent.setup();
    render(<PageActions {...defaultProps} />);
    
    const shareButton = screen.getByLabelText(/share page/i);
    await user.click(shareButton);
    
    expect(screen.getByText(/share this page/i)).toBeInTheDocument();
  });

  it('should render separator', () => {
    const { container } = render(<PageActions {...defaultProps} />);
    expect(container.querySelector('.separator')).toBeInTheDocument();
  });
});
