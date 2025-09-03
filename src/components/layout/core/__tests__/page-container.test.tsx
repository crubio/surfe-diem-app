import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { vi } from 'vitest';
import PageContainer from '../page-container';

// Mock MUI components
vi.mock('@mui/material', () => ({
  Container: ({ children, maxWidth, sx }: any) => (
    <div data-testid="container" data-max-width={maxWidth} style={sx}>
      {children}
    </div>
  ),
  Box: ({ children, sx }: any) => (
    <div data-testid="box" style={sx}>
      {children}
    </div>
  ),
  ThemeProvider: ({ children }: any) => children,
  createTheme: () => ({}),
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('PageContainer', () => {
  it('renders with default props', () => {
    render(
      <TestWrapper>
        <PageContainer>
          <div>Test Content</div>
        </PageContainer>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('box')).toBeInTheDocument();
  });

  it('renders with custom maxWidth', () => {
    render(
      <TestWrapper>
        <PageContainer maxWidth="LG">
          <div>Test Content</div>
        </PageContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveAttribute('data-max-width', 'lg');
  });

  it('renders with custom padding', () => {
    render(
      <TestWrapper>
        <PageContainer padding="LARGE">
          <div>Test Content</div>
        </PageContainer>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with custom background', () => {
    render(
      <TestWrapper>
        <PageContainer background="PAPER">
          <div>Test Content</div>
        </PageContainer>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with fullHeight', () => {
    render(
      <TestWrapper>
        <PageContainer fullHeight={true}>
          <div>Test Content</div>
        </PageContainer>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
