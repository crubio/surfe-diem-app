import React from 'react';
import { Container, Box } from '@mui/material';
import { CONTAINER_MAX_WIDTHS, PAGE_PADDING, BACKGROUND_VARIANTS } from '../constants/layout-constants';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof CONTAINER_MAX_WIDTHS;
  padding?: keyof typeof PAGE_PADDING;
  marginTop?: number | { xs: number; sm: number };
  background?: keyof typeof BACKGROUND_VARIANTS;
  fullHeight?: boolean;
  centered?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'XL',
  padding = 'MEDIUM',
  marginTop = 0,
  background = 'DEFAULT',
  fullHeight = false,
  centered = false,
}) => {
  const containerMaxWidth = CONTAINER_MAX_WIDTHS[maxWidth];
  const paddingValues = PAGE_PADDING[padding];
  const backgroundColor = BACKGROUND_VARIANTS[background];

  return (
    <Box
      sx={{
        bgcolor: backgroundColor,
        minHeight: fullHeight ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: centered ? 'center' : 'stretch',
        marginTop: typeof marginTop === 'object' ? marginTop : marginTop,
      }}
    >
      <Container
        maxWidth={containerMaxWidth}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: typeof paddingValues === 'object' && 'xs' in paddingValues ? paddingValues.xs : 0,
          py: typeof paddingValues === 'object' && 'sm' in paddingValues ? paddingValues.sm : 0,
          width: '100%',
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default PageContainer;
