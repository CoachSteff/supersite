import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SharePopup from '@/components/SharePopup';

describe('SharePopup', () => {
  const defaultProps = {
    title: 'Test Page',
    url: 'http://localhost:3000/test',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should render share options', () => {
    render(<SharePopup {...defaultProps} />);
    
    expect(screen.getByText(/share this page/i)).toBeInTheDocument();
    expect(screen.getByText(/copy link/i)).toBeInTheDocument();
    expect(screen.getByText(/share on x/i)).toBeInTheDocument();
    expect(screen.getByText(/share on linkedin/i)).toBeInTheDocument();
    expect(screen.getByText(/share via email/i)).toBeInTheDocument();
  });

  it('should copy link to clipboard', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    
    render(<SharePopup {...defaultProps} />);
    
    const copyLinkButton = screen.getByText(/copy link/i);
    await user.click(copyLinkButton);
    
    // Wait for alert confirmation
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });

  it('should open X share in new window', async () => {
    const user = userEvent.setup();
    render(<SharePopup {...defaultProps} />);
    
    const xButton = screen.getByText(/share on x/i);
    await user.click(xButton);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should open LinkedIn share in new window', async () => {
    const user = userEvent.setup();
    render(<SharePopup {...defaultProps} />);
    
    const linkedinButton = screen.getByText(/share on linkedin/i);
    await user.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should close on overlay click', () => {
    render(<SharePopup {...defaultProps} />);
    
    const overlay = screen.getByText(/share this page/i).closest('.overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('should close on close button click', async () => {
    const user = userEvent.setup();
    render(<SharePopup {...defaultProps} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should close on Escape key', () => {
    render(<SharePopup {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
