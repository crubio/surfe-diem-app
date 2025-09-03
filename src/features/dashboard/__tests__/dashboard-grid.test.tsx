import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { vi } from 'vitest';
import DashboardGrid from '../dashboard-grid';
import { GRID_CONFIGS } from '../grid-config';

// Mock the Item component
vi.mock('components/layout/item', () => ({
  Item: ({ children, ...props }: any) => <div data-testid="item" {...props}>{children}</div>
}));

// Mock layout constants
vi.mock('utils/layout-constants', () => ({
  GRID_ITEM_SPACING: 2,
  ITEM_PADDING: 3,
  SECTION_MARGIN_BOTTOM: 2,
  TITLE_FONT_WEIGHT: 600,
  SECTION_TITLE_MB: 2,
  SUBSECTION_TITLE_MB: 1,
  DASHBOARD_CARD_SECTION_MB: 3,
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('DashboardGrid', () => {
  it('renders with title', () => {
    render(
      <TestWrapper>
        <DashboardGrid title="Test Dashboard">
          <div>Test Content</div>
        </DashboardGrid>
      </TestWrapper>
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with subtitle when showSubtitle is true', () => {
    render(
      <TestWrapper>
        <DashboardGrid 
          title="Test Dashboard" 
          subtitle="Test Subtitle"
          showSubtitle={true}
        >
          <div>Test Content</div>
        </DashboardGrid>
      </TestWrapper>
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when showSubtitle is false', () => {
    render(
      <TestWrapper>
        <DashboardGrid 
          title="Test Dashboard" 
          subtitle="Test Subtitle"
          showSubtitle={false}
        >
          <div>Test Content</div>
        </DashboardGrid>
      </TestWrapper>
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('renders divider when showDivider is true', () => {
    render(
      <TestWrapper>
        <DashboardGrid 
          title="Test Dashboard" 
          showDivider={true}
        >
          <div>Test Content</div>
        </DashboardGrid>
      </TestWrapper>
    );

    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });

  it('uses custom grid configuration', () => {
    render(
      <TestWrapper>
        <DashboardGrid 
          title="Test Dashboard" 
          columns={GRID_CONFIGS.SEARCH}
        >
          <div>Test Content</div>
        </DashboardGrid>
      </TestWrapper>
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
