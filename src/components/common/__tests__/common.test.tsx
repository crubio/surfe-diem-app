import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoDataFound from '../not-found';
import ImageBox from '../image-box';
import PageContainer from '../container';
import { LinkRouter } from '../link-router';
import ResizableBox from '../resizable-box';
import { MemoryRouter } from 'react-router-dom';

describe('NoDataFound', () => {
  it('renders no data found message', () => {
    render(<NoDataFound />);
    expect(screen.getByText(/No data found/i)).toBeInTheDocument();
  });
});

describe('ImageBox', () => {
  it('renders image with src and alt', () => {
    render(<ImageBox src="test.jpg" alt="test alt" />);
    const img = screen.getByAltText('test alt');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
  });
});

describe('PageContainer', () => {
  it('renders children', () => {
    render(<PageContainer><div>child</div></PageContainer>);
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

describe('LinkRouter', () => {
  it('renders a link with correct to prop', () => {
    render(
      <MemoryRouter>
        <LinkRouter to="/test">Test Link</LinkRouter>
      </MemoryRouter>
    );
    const link = screen.getByText('Test Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});

describe('ResizableBox', () => {
  it('renders children in resizable mode', () => {
    render(<ResizableBox><div>resize child</div></ResizableBox>);
    expect(screen.getByText('resize child')).toBeInTheDocument();
  });
  it('renders children in non-resizable mode', () => {
    render(<ResizableBox resizable={false}><div>fixed child</div></ResizableBox>);
    expect(screen.getByText('fixed child')).toBeInTheDocument();
  });
}); 