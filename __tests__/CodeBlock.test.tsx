import { render, screen, fireEvent, act } from '@testing-library/react';
import CodeBlock from '@/components/CodeBlock';

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock code="console.log('hello')" language="javascript" />);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it('displays language label after mount', () => {
    render(<CodeBlock code="test" language="javascript" />);
    expect(screen.getByText('JAVASCRIPT')).toBeInTheDocument();
  });

  it('extracts language from className', () => {
    render(<CodeBlock code="test" className="language-python" />);
    expect(screen.getByText('PYTHON')).toBeInTheDocument();
  });

  it('shows copy button after client mount', () => {
    render(<CodeBlock code="test" language="js" />);
    const copyButton = screen.getByLabelText('Copy code');
    expect(copyButton).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('copies text to clipboard on button click', async () => {
    const mockClipboard = (global as any).mockClipboard;
    render(<CodeBlock code="const x = 1;" language="js" />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy code'));
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('shows "Copied!" feedback with live region', async () => {
    render(<CodeBlock code="test" language="js" />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy code'));
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Copied!');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('extracts text from React node children', () => {
    const children = (
      <>
        <span>const</span> <span>x</span> = <span>1</span>
      </>
    );
    render(<CodeBlock code="" language="js">{children}</CodeBlock>);
    // The component should render the children
    expect(screen.getByText('const')).toBeInTheDocument();
  });

  it('has aria-hidden on SVG icons', async () => {
    render(<CodeBlock code="test" language="js" />);
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
